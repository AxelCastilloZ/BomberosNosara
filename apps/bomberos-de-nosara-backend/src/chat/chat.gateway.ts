import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleEnum } from '../roles/role.enum';
import { ChatService } from './services/chat.service';

interface ConnectedClient {
  userId: string | number;
  lastSeen: Date;
  role?: RoleEnum;
}

interface DirectMessagePayload {
  to: string | number;
  message: string;
  senderId: string | number;
  isGroup?: boolean;
}

interface RoleMessagePayload {
  role: RoleEnum;
  message: string;
  senderId: string | number;
  groupName: string;
}

/**
 * CORS:
 *  - FRONTEND_URL puede ser una lista separada por comas (ej: http://localhost:5173,http://127.0.0.1:5173)
 *  - credentials activado para permitir cookies si las usas (opcional para Socket.IO).
 */
@WebSocketGateway({
  cors: {
    origin: (origin, cb) => {
      // Permitir herramientas locales (no-origin) y lista blanca desde .env
      const allowNoOrigin = !origin; // devtools, curl, etc.
      const env = process.env.FRONTEND_URL || process.env.APP_BASE_URL || 'http://localhost:5173';
      const whitelist = env.split(',').map(s => s.trim());
      if (allowNoOrigin || whitelist.some(o => origin?.startsWith(o))) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed`), false);
    },
    credentials: true,
  },
  // path: '/socket.io', // usa el default a menos que lo cambies también en el cliente
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedClients = new Map<string, ConnectedClient>();
  private superuserIds: Set<number> = new Set();

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {
    this.loadSuperusers();
  }

  afterInit(server: Server) {
    this.server = server;
    console.log('[ws] initialized');
  }

  // ---------------- helpers ----------------

  private async loadSuperusers() {
    try {
      const sus = await this.chatService.getUsersByRole(RoleEnum.SUPERUSER);
      this.superuserIds = new Set(sus.map((u: any) => Number(u.id)));
      console.log(`[ws] SUPERUSER count: ${this.superuserIds.size}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[ws] load superusers error:', msg);
    }
  }

  /** token desde handshake.auth.token o header Authorization; acepta 'Bearer x' o crudo */
  private getTokenFromSocket(client: Socket): string | null {
    const raw = (client.handshake.auth as any)?.token || client.handshake.headers?.authorization || null;
    if (!raw) return null;
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  }

  private getOnlineUserIds(): number[] {
    const set = new Set<number>();
    this.connectedClients.forEach(c => set.add(Number(c.userId)));
    return [...set];
  }

  private notifyUserStatus(userId: number | string, status: 'online' | 'offline') {
    this.server.emit('userStatus', { userId, status });
  }

  private notifyOnlineUsers(client: Socket) {
    client.emit('onlineUsers', this.getOnlineUserIds());
  }

  private async addSuperusersToRoom(roomName: string) {
    for (const [sid, data] of this.connectedClients.entries()) {
      if (this.superuserIds.has(Number(data.userId))) {
        const s = this.server.sockets.sockets.get(sid);
        if (s && !s.rooms.has(roomName)) await s.join(roomName);
      }
    }
  }

  // ---------------- lifecycle ----------------

  async handleConnection(client: Socket) {
    try {
      const token = this.getTokenFromSocket(client);
      if (!token) throw new UnauthorizedException('No token');

      const secret = this.config.getOrThrow<string>('JWT_SECRET');
      const payload: any = await this.jwtService.verifyAsync(token, { secret });
      const userId = payload.sub;
      const roles: string[] = payload.roles || [];

      this.connectedClients.set(client.id, { userId, lastSeen: new Date(), role: payload.role });

      await client.join(`user_${userId}`);
      for (const r of roles) await client.join(`role-${r}`);

      if (this.superuserIds.has(Number(userId)) || roles.includes('SUPERUSER')) {
        for (const rr of ['role-ADMIN', 'role-PERSONAL_BOMBERIL', 'role-VOLUNTARIO']) {
          await client.join(rr);
        }
        this.superuserIds.add(Number(userId));
      }

      client.emit('connected', { status: 'connected', clientId: client.id, userId });
      this.notifyUserStatus(userId, 'online');
      this.notifyOnlineUsers(client);
      console.log(`[ws] connect OK ${client.id} u=${userId}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[ws] connection error:', msg);
      client.emit('error', { message: 'Authentication failed', error: msg });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const data = this.connectedClients.get(client.id);
    if (!data) return;
    const { userId } = data;

    this.connectedClients.delete(client.id);
    const stillOnline = [...this.connectedClients.values()].some(c => String(c.userId) === String(userId));
    if (!stillOnline) this.notifyUserStatus(userId, 'offline');
    console.log(`[ws] disconnect ${client.id} u=${userId}`);
  }

  // ---------------- app messages ----------------

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    this.notifyOnlineUsers(client);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string | number; isGroup?: boolean },
  ) {
    const auth = this.connectedClients.get(client.id);
    if (!auth) throw new UnauthorizedException('Not authenticated');

    const conversationId = Number(data.conversationId);
    const isGroup = !!data.isGroup;

    // salir de otras salas de conv/grupo
    for (const room of client.rooms) {
      if (room !== client.id && (room.startsWith('conversation_') || room.startsWith('group_'))) client.leave(room);
    }

    const room = isGroup ? `group_${conversationId}` : `conversation_${conversationId}`;
    await client.join(room);
    await this.addSuperusersToRoom(room);

    client.emit('conversationJoined', { conversationId, isGroup, room });
    return { success: true, room };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: DirectMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { to, message, senderId, isGroup = false } = data;
      if (!message) throw new Error('Message content is required');

      const targetId = Number(to);
      if (!targetId) throw new Error(`Invalid ${isGroup ? 'group' : 'user'} ID`);

      let msg: any;
      let roomToBroadcast: string;

      if (isGroup) {
        const conv = await this.chatService.getConversationById(targetId);
        if (!conv) throw new Error('Conversation not found');

        const saved = await this.chatService.createMessage(
          { content: message, conversationId: conv.id },
          Number(senderId),
        );

        msg = {
          id: saved.id,
          content: saved.content,
          timestamp: saved.createdAt.toISOString(),
          conversationId: saved.conversation.id,
          isGroup: true,
          groupId: saved.conversation.id,
          sender: { id: saved.sender.id, username: saved.sender.username || 'Usuario' },
        };

        roomToBroadcast = `group_${targetId}`;
        await this.addSuperusersToRoom(roomToBroadcast);
      } else {
        const conv = await this.chatService.getConversationWithUser(Number(senderId), targetId);

        const saved = await this.chatService.createMessage(
          { content: message, conversationId: conv.id, senderId: Number(senderId) },
          Number(senderId),
        );

        msg = {
          id: saved.id,
          content: saved.content,
          senderId: saved.sender.id,
          to: targetId,
          timestamp: saved.createdAt.toISOString(),
          isGroup: false,
          sender: { id: saved.sender.id, username: saved.sender.username || 'Usuario' },
          conversationId: saved.conversation.id,
        };

        roomToBroadcast = `user_${targetId}`;
        await this.addSuperusersToRoom(`conversation_${saved.conversation.id}`);
      }

      this.server.to(roomToBroadcast).emit('newMessage', { ...msg, isOwn: false });
      this.server.to(`user_${senderId}`).emit('newMessage', { ...msg, isOwn: true });

      // copia a superusers (excepto emisor)
      for (const [sid, c] of this.connectedClients.entries()) {
        if (this.superuserIds.has(Number(c.userId)) && String(c.userId) !== String(senderId)) {
          this.server.to(sid).emit('newMessage', { ...msg, isOwn: false, isSuperuserCopy: true });
        }
      }

      return { success: true, message: msg, timestamp: new Date().toISOString() };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[ws] sendMessage error:', msg);
      return { success: false, error: msg };
    }
  }

  @SubscribeMessage('sendToRole')
  async handleRoleMessage(
    @MessageBody() data: RoleMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { role, message, senderId, groupName } = data;
      if (!role || !message) throw new Error('Role and message content are required');

      let groupConv = await this.chatService.findGroupConversation(role, Number(senderId));
      if (!groupConv) {
        const users = await this.chatService.getUsersByRole(role);
        groupConv = await this.chatService.createGroupConversation(
          { groupName, participantIds: users.map((u: any) => u.id) },
          Number(senderId),
        );
      }

      const saved = await this.chatService.createMessage(
        { content: message, conversationId: groupConv.id },
        Number(senderId),
      );

      const msg = {
        id: saved.id,
        content: saved.content,
        senderId: saved.sender.id,
        conversationId: saved.conversation.id,
        timestamp: saved.createdAt.toISOString(),
        isGroup: true,
        groupId: role,
        sender: { id: saved.sender.id, username: saved.sender.username },
      };

      const roleRoom = `role-${role}`;
      await this.addSuperusersToRoom(roleRoom);

      const sockets = await this.server.in(roleRoom).fetchSockets();
      for (const s of sockets) {
        const uid = this.connectedClients.get(s.id)?.userId;
        if (String(uid) !== String(senderId)) {
          this.server.to(s.id).emit('newMessage', { ...msg, isOwn: false });
        }
      }

      // copia a superusers (excepto emisor)
      for (const [sid, c] of this.connectedClients.entries()) {
        if (this.superuserIds.has(Number(c.userId)) && String(c.userId) !== String(senderId)) {
          this.server.to(sid).emit('newMessage', { ...msg, isOwn: false, isSuperuserCopy: true });
        }
      }

      return { success: true, message: msg, timestamp: new Date().toISOString() };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[ws] sendToRole error:', msg);
      return { success: false, error: msg };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody()
    data: {
      to: string | number;
      isTyping: boolean;
      userId: string | number;
      username: string;
      isGroup?: boolean;
      role?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const auth = this.connectedClients.get(client.id);
    if (!auth) throw new UnauthorizedException('Not authenticated');

    const { to, isTyping, userId, username, isGroup = false, role } = data;

    if (isGroup && role) {
      client.to(`role-${role}`).emit('typing', {
        userId,
        username,
        isTyping,
        isGroup: true,
        role,
        timestamp: new Date().toISOString(),
      });
    } else if (!isGroup) {
      this.server.to(`user_${to}`).emit('typing', {
        userId,
        username,
        isTyping,
        isGroup: false,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    console.log('Message created event received:', payload);
  }
}
