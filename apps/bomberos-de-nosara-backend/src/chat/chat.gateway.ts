import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleEnum } from '../roles/role.enum';
import { ChatService } from './services/chat.service';

interface ConnectedClient {
  userId: string|number;
  lastSeen: Date;
  role?: RoleEnum;
}

interface DirectMessagePayload {
  to: string|number;
  message: string;
  senderId: string|number;
  isGroup?: boolean;
}

interface RoleMessagePayload {
  role: RoleEnum;
  message: string;
  senderId: string|number;
  groupName: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Reemplazar con la URL de la aplicacion
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients=new Map<string, ConnectedClient>();
  private superuserIds: Set<number> = new Set();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService
  ) {
    this.server=new Server();
    this.loadSuperusers();
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
    this.server=server;
  }

  private async loadSuperusers() {
    try {
      const superusers = await this.chatService.getUsersByRole(RoleEnum.SUPERUSER);
      this.superuserIds = new Set(superusers.map(user => user.id));
      console.log(`Loaded ${this.superuserIds.size} SUPERUSER users:`, Array.from(this.superuserIds));
    } catch (error) {
      console.error('Error loading SUPERUSER users:', error);
    }
  }

  private async addSuperusersToRoom(roomName: string) {
    try {
      for (const [socketId, clientData] of this.connectedClients.entries()) {
        if (this.superuserIds.has(Number(clientData.userId))) {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket && !socket.rooms.has(roomName)) {
            await socket.join(roomName);
            console.log(`[SUPERUSER] Added SUPERUSER ${clientData.userId} to room ${roomName}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error adding SUPERUSER users to room ${roomName}:`, error);
    }
  }

  private async sendMessageToSuperusers(messageData: any, excludeSenderId?: string|number) {
    try {
      console.log(`[DEBUG] sendMessageToSuperusers called. SuperuserIds:`, Array.from(this.superuserIds));
      console.log(`[DEBUG] Connected clients:`, Array.from(this.connectedClients.entries()).map(([id, data]) => ({ socketId: id, userId: data.userId, role: data.role })));
      
      for (const [socketId, clientData] of this.connectedClients.entries()) {
        console.log(`[DEBUG] Checking client ${clientData.userId}, isSuperuser: ${this.superuserIds.has(Number(clientData.userId))}, excludeSender: ${String(clientData.userId) !== String(excludeSenderId)}`);
        
        if (this.superuserIds.has(Number(clientData.userId)) && 
            String(clientData.userId) !== String(excludeSenderId)) {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('newMessage', {
              ...messageData,
              isOwn: false,
              isSuperuserCopy: true
            });
            console.log(`[SUPERUSER] Sent message to SUPERUSER ${clientData.userId}`);
          } else {
            console.log(`[DEBUG] Socket not found for SUPERUSER ${clientData.userId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message to SUPERUSER users:', error);
    }
  }

  private getOnlineUserIds(): number[] {
    const uniqueUserIds = new Set<number>();
    this.connectedClients.forEach(client => {
      if (typeof client.userId === 'number') {
        uniqueUserIds.add(client.userId);
      } else if (!isNaN(Number(client.userId))) {
        uniqueUserIds.add(Number(client.userId));
      }
    });
    return Array.from(uniqueUserIds);
  }

  private notifyUserStatus(userId: number | string, status: 'online' | 'offline') {
    const statusData = { userId, status };
    this.server.emit('userStatus', statusData);
    console.log(`User ${userId} is now ${status}`);
  }

  private notifyOnlineUsers(client: Socket) {
    const onlineUserIds = this.getOnlineUserIds();
    client.emit('onlineUsers', onlineUserIds);
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    this.notifyOnlineUsers(client);
  }

  async handleConnection(client: Socket) {
    try {
      console.log(`Client connecting: ${client.id}`);

      const token = this.getTokenFromSocket(client);
      if (!token) {
        console.log('No token provided');
        throw new UnauthorizedException('No token provided');
      }

      const jwt_secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret: jwt_secret });

      if (!payload) {
        console.log('Invalid token');
        throw new UnauthorizedException('Invalid token');
      }

      const userId = payload.sub;
      const userRoles = payload.roles || [];

      this.connectedClients.set(client.id, {
        userId,
        lastSeen: new Date(),
        role: payload.role
      });

      console.log(`Client connected: ${client.id}, User ID: ${userId}, Role: ${userRoles[0]}`);

      await client.join(`user_${userId}`);
      
      if (userRoles?.length) {
        for (const role of userRoles) {
          const roleRoom = `role-${role}`;
          await client.join(roleRoom);
          console.log(`[CONNECTION] User ${userId} joined role room: ${roleRoom}`);
          
          // Add all SUPERUSER users to this role room
          await this.addSuperusersToRoom(roleRoom);
        }
      } else {
        console.log(`[CONNECTION] No roles found in JWT payload for user ${userId}`);
      }
      
      // If this user is a SUPERUSER, add them to all existing role rooms
      console.log(`[DEBUG] Checking if user ${userId} is SUPERUSER. SuperuserIds:`, Array.from(this.superuserIds));
      console.log(`[DEBUG] User roles:`, userRoles);
      
      if (this.superuserIds.has(Number(userId)) || userRoles.includes('SUPERUSER')) {
        console.log(`[SUPERUSER] User ${userId} is a SUPERUSER, adding to all role rooms`);
        const allRoleRooms = ['role-ADMIN', 'role-PERSONAL_BOMBERIL', 'role-VOLUNTARIO'];
        for (const roleRoom of allRoleRooms) {
          await client.join(roleRoom);
          console.log(`[SUPERUSER] SUPERUSER ${userId} joined role room: ${roleRoom}`);
        }
        
        // Also ensure this user is in the superuserIds set
        this.superuserIds.add(Number(userId));
      }

      client.emit('connected', {
        status: 'connected',
        clientId: client.id,
        userId,
        role: payload.role
      });

      this.notifyUserStatus(userId, 'online');
      
      this.notifyOnlineUsers(client);

    } catch (error) {
      const errorMessage=error instanceof Error? error.message:'Unknown error';
      console.error('Connection error:', errorMessage);

      client.emit('error', {
        message: 'Authentication failed',
        error: errorMessage
      });

      client.disconnect(true);
    }
  }

  private getTokenFromSocket(client: Socket): string|null {
    const authHeader=client.handshake.headers.authorization;
    if (!authHeader) return null;

    const [type, token]=authHeader.split(' ');
    return type==='Bearer'? token:null;
  }

  async handleDisconnect(client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (!clientData) return;

    const { userId } = clientData;
    console.log(`Client disconnected: ${client.id}, User ID: ${userId}`);
    
    this.connectedClients.delete(client.id);

    const isUserStillOnline = Array.from(this.connectedClients.values())
      .some(client => client.userId === userId);
    if (!isUserStillOnline) {
      this.notifyUserStatus(userId, 'offline');
    }

    client.rooms.forEach(room => client.leave(room));
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, data: { conversationId: string, isGroup?: boolean }) {
    const clientData=this.connectedClients.get(client.id);
    if (!clientData) {
      throw new UnauthorizedException('Not authenticated');
    }

    const { conversationId, isGroup=false }=data;

    if (isGroup) {
      const hasAccess=await this.chatService.userHasAccessToConversation(
        Number(clientData.userId),
        Number(conversationId)
      );

      if (!hasAccess) {
        throw new UnauthorizedException('You do not have access to this conversation');
      }
    }

    client.rooms.forEach(room => {
      if (room!==client.id&&(room.startsWith('conversation_')||room.startsWith('group_'))) {
        client.leave(room);
      }
    });

    const roomName=isGroup? `group_${conversationId}`:`conversation_${conversationId}`;
    await client.join(roomName);
    console.log(`User ${clientData.userId} joined ${isGroup? 'group':'conversation'} ${conversationId}`);
    
    // Add all SUPERUSER users to this conversation room
    await this.addSuperusersToRoom(roomName);

    client.emit('conversationJoined', {
      conversationId,
      isGroup,
      room: roomName
    });

    return { success: true, room: roomName };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: DirectMessagePayload,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { to, message, senderId, isGroup=false }=data;
      console.log('Data:', data)
      console.log(`Sending message from ${senderId} to ${isGroup? 'group':'user'} ${to}: ${message}`);

      if (!message) {
        throw new Error('Message content is required');
      }

      const targetId=Number(to);
      console.log('Target ID:', targetId);
      if (isNaN(targetId)) {
        throw new Error(`Invalid ${isGroup? 'group':'user'} ID: ${to}`);
      }

      let messageData;
      let roomName: string;

      if (isGroup) {
        console.log('Sending group message');
        console.log('Target ID:', targetId);
        console.log('Sender ID:', senderId);
        const conversation=await this.chatService.getConversationById(targetId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }

        const isParticipant=conversation.participants.some(p => p.id===Number(senderId));
        if (!isParticipant) {
          throw new Error('You are not a participant of this group');
        }

        const savedMessage=await this.chatService.createMessage({
          content: message,
          conversationId: conversation.id
        }, Number(senderId));

        messageData={
          id: savedMessage.id,
          content: savedMessage.content,
          timestamp: savedMessage.createdAt.toISOString(),
          conversationId: savedMessage.conversation.id,
          isGroup: true,
          groupId: savedMessage.conversation.id,
          sender: {
            id: savedMessage.sender.id,
            username: savedMessage.sender.username||'Usuario'
          }
        };

        roomName=`group_${targetId}`;
        
        // Ensure SUPERUSER users are in the group room
        await this.addSuperusersToRoom(roomName);

      } else {
        const conversation=await this.chatService.getConversationWithUser(
          Number(senderId),
          targetId
        );

        const savedMessage=await this.chatService.createMessage({
          content: message,
          conversationId: conversation.id,
          senderId: Number(senderId)
        }, Number(senderId));

        messageData={
          id: savedMessage.id,
          content: savedMessage.content,
          senderId: savedMessage.sender.id,
          to: targetId,
          timestamp: savedMessage.createdAt.toISOString(),
          isGroup: false,
          sender: {
            id: savedMessage.sender.id,
            username: savedMessage.sender.username||'Usuario'
          },
          conversationId: savedMessage.conversation.id
        };

        roomName=`user_${targetId}`;
        
        // Ensure SUPERUSER users are in the conversation room
        const conversationRoom = `conversation_${savedMessage.conversation.id}`;
        await this.addSuperusersToRoom(conversationRoom);
      }

      this.server.to(roomName).emit('newMessage', {
        ...messageData,
        isOwn: false
      });

      this.server.to(`user_${senderId}`).emit('newMessage', {
        ...messageData,
        isOwn: true
      });
      
      // Ensure all connected SUPERUSER users receive the message
      await this.sendMessageToSuperusers(messageData, senderId);

      return {
        success: true,
        message: messageData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error? error.message:'Failed to send message'
      };
    }
  }

  @SubscribeMessage('sendToRole')
  async handleRoleMessage(
    @MessageBody() data: RoleMessagePayload,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { role, message, senderId, groupName }=data;
      console.log('Role:', data);

      console.log(`[GROUP CHAT] Received data:`, JSON.stringify(data));
      console.log(`[GROUP CHAT] Sending message to role ${role} from ${senderId}: ${message}`);

      if (!role||!message) {
        throw new Error('Role and message content are required');
      }

      let groupConversation;
      try {
        console.log(`[GROUP CHAT] Looking for existing group conversation for role: ${role}`);
        groupConversation=await this.chatService.findGroupConversation(role, Number(senderId));

        if (!groupConversation) {
          console.log(`[GROUP CHAT] No existing conversation found, creating new one`);

          try {
            const allConversations=await this.chatService.getConversations(Number(senderId));
            const existingGroup=allConversations.find(conv =>
              conv.isGroup&&conv.groupName===groupName
            );

            if (existingGroup) {
              console.log(`[GROUP CHAT] Found existing group conversation during double-check: ${existingGroup.id}`);
              groupConversation=existingGroup;
            } else {
              const usersWithRole=await this.chatService.getUsersByRole(role);
              console.log(`[GROUP CHAT] Found ${usersWithRole.length} users with role ${role}:`, usersWithRole.map(u => u.id));
              const participantIds=usersWithRole.map((user: any) => user.id);

              groupConversation=await this.chatService.createGroupConversation({
                groupName: groupName,
                participantIds: participantIds
              }, Number(senderId));
              console.log(`[GROUP CHAT] Created new group conversation with ID: ${groupConversation.id}`);
            }
          } catch (doubleCheckError) {
            console.error('[GROUP CHAT] Error during double-check, proceeding with creation:', doubleCheckError);
            const usersWithRole=await this.chatService.getUsersByRole(role);
            const participantIds=usersWithRole.map((user: any) => user.id);
            groupConversation=await this.chatService.createGroupConversation({
              groupName: groupName,
              participantIds: participantIds
            }, Number(senderId));
          }
        } else {
          console.log(`[GROUP CHAT] Using existing group conversation with ID: ${groupConversation.id}`);
        }
      } catch (error) {
        console.error('[GROUP CHAT] Error handling group conversation:', error);
        throw new Error('Failed to create or find group conversation');
      }

      console.log(`[GROUP CHAT] Saving message to database for conversation ${groupConversation.id}`);
      const savedMessage=await this.chatService.createMessage({
        content: message,
        conversationId: groupConversation.id
      }, Number(senderId));
      console.log(`[GROUP CHAT] Message saved with ID: ${savedMessage.id}`);

      const messageData={
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.sender.id,
        conversationId: savedMessage.conversation.id,
        timestamp: savedMessage.createdAt.toISOString(),
        isGroup: true,
        groupId: role,
        sender: {
          id: savedMessage.sender.id,
          username: savedMessage.sender.username
        }
      };

      console.log(`[GROUP CHAT] Prepared message data:`, JSON.stringify(messageData));

      const roleRoom=`role-${role}`;
      console.log(`[GROUP CHAT] Broadcasting to role room: ${roleRoom} (excluding sender ${senderId})`);
      
      // Ensure SUPERUSER users are in the role room
      await this.addSuperusersToRoom(roleRoom);

      const socketsInRoom=await this.server.in(roleRoom).fetchSockets();
      console.log(`[GROUP CHAT] Found ${socketsInRoom.length} sockets in room ${roleRoom}`);
      console.log(`[GROUP CHAT] Sockets in room:`, socketsInRoom.map(s => ({ id: s.id, userId: this.connectedClients.get(s.id)?.userId })));

      for (const socket of socketsInRoom) {
        const socketUserId=this.connectedClients.get(socket.id)?.userId;
        if (String(socketUserId)!==String(senderId)) {
          this.server.to(socket.id).emit('newMessage', {
            ...messageData,
            isOwn: false
          });
        }
      }
      
      // Ensure all connected SUPERUSER users receive the group message
      await this.sendMessageToSuperusers(messageData, senderId);

      console.log(`[GROUP CHAT] Message sent to all group members except sender`);

      return {
        success: true,
        message: messageData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending role message:', error);
      return {
        success: false,
        error: error instanceof Error? error.message:'Failed to send role message'
      };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: {
      to: string|number;
      isTyping: boolean;
      userId: string|number;
      username: string;
      isGroup?: boolean;
      role?: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const clientData=this.connectedClients.get(client.id);
      if (!clientData) {
        throw new UnauthorizedException('Not authenticated');
      }

      const { to, isTyping, userId, username, isGroup=false, role }=data;

      if (isGroup&&role) {
        client.to(`role-${role}`).emit('typing', {
          userId,
          username,
          isTyping,
          isGroup: true,
          role,
          timestamp: new Date().toISOString()
        });
        
        // Send typing indicators to SUPERUSER users
        for (const [socketId, clientData] of this.connectedClients.entries()) {
          if (this.superuserIds.has(Number(clientData.userId)) && 
              String(clientData.userId) !== String(userId)) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
              socket.emit('typing', {
                userId,
                username,
                isTyping,
                isGroup: true,
                role,
                timestamp: new Date().toISOString(),
                isSuperuserCopy: true
              });
            }
          }
        }
      } else if (!isGroup) {
        this.server.to(`user_${to}`).emit('typing', {
          userId,
          username,
          isTyping,
          isGroup: false,
          timestamp: new Date().toISOString()
        });
        
        // Send typing indicators to SUPERUSER users for direct messages
        for (const [socketId, clientData] of this.connectedClients.entries()) {
          if (this.superuserIds.has(Number(clientData.userId)) && 
              String(clientData.userId) !== String(userId) &&
              String(clientData.userId) !== String(to)) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
              socket.emit('typing', {
                userId,
                username,
                isTyping,
                isGroup: false,
                timestamp: new Date().toISOString(),
                isSuperuserCopy: true
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    console.log('Message created event received:', payload);
  }
}
