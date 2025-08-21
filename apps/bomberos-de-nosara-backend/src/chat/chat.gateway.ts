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

  // Track connected clients by their socket ID
  private connectedClients=new Map<string, ConnectedClient>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService
  ) {
    this.server=new Server();
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
    this.server=server;
  }

  // Get all currently connected user IDs
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

  // Notify all clients about a user's status change
  private notifyUserStatus(userId: number | string, status: 'online' | 'offline') {
    const statusData = { userId, status };
    // Notify everyone about the status change
    this.server.emit('userStatus', statusData);
    console.log(`User ${userId} is now ${status}`);
  }

  // Notify a specific client about all online users
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

      // Store minimal client data with role
      this.connectedClients.set(client.id, {
        userId,
        lastSeen: new Date(),
        role: payload.role
      });

      console.log(`Client connected: ${client.id}, User ID: ${userId}, Role: ${userRoles[0]}`);

      // Join user's personal room for direct messages
      await client.join(`user_${userId}`);
      
      // Join role-based rooms
      if (userRoles?.length) {
        for (const role of userRoles) {
          const roleRoom = `role-${role}`;
          await client.join(roleRoom);
          console.log(`[CONNECTION] User ${userId} joined role room: ${roleRoom}`);
        }
      } else {
        console.log(`[CONNECTION] No roles found in JWT payload for user ${userId}`);
      }

      // Notify the client about their connection status
      client.emit('connected', {
        status: 'connected',
        clientId: client.id,
        userId,
        role: payload.role
      });

      // Notify all clients about this user coming online
      this.notifyUserStatus(userId, 'online');
      
      // Send the list of online users to the newly connected client
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
    
    // Remove client from connected clients
    this.connectedClients.delete(client.id);

    // Check if this was the last connection for this user
    const isUserStillOnline = Array.from(this.connectedClients.values())
      .some(client => client.userId === userId);

    // If user has no more active connections, notify others they're offline
    if (!isUserStillOnline) {
      this.notifyUserStatus(userId, 'offline');
    }

    // Leave all rooms
    client.rooms.forEach(room => client.leave(room));
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, data: { conversationId: string, isGroup?: boolean }) {
    const clientData=this.connectedClients.get(client.id);
    if (!clientData) {
      throw new UnauthorizedException('Not authenticated');
    }

    const { conversationId, isGroup=false }=data;

    // If joining a group conversation, verify the user has access
    if (isGroup) {
      const hasAccess=await this.chatService.userHasAccessToConversation(
        Number(clientData.userId),
        Number(conversationId)
      );

      if (!hasAccess) {
        throw new UnauthorizedException('You do not have access to this conversation');
      }
    }

    // Leave any existing conversation rooms
    client.rooms.forEach(room => {
      if (room!==client.id&&(room.startsWith('conversation_')||room.startsWith('group_'))) {
        client.leave(room);
      }
    });

    // Join the new conversation room
    const roomName=isGroup? `group_${conversationId}`:`conversation_${conversationId}`;
    await client.join(roomName);
    console.log(`User ${clientData.userId} joined ${isGroup? 'group':'conversation'} ${conversationId}`);

    // Notify the client they've successfully joined
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

      // Convert to number and validate
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
        // For group messages
        const conversation=await this.chatService.getConversationById(targetId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Verify user is a participant in the group
        const isParticipant=conversation.participants.some(p => p.id===Number(senderId));
        if (!isParticipant) {
          throw new Error('You are not a participant of this group');
        }

        // Save the message to the database
        const savedMessage=await this.chatService.createMessage({
          content: message,
          conversationId: conversation.id
        }, Number(senderId));

        // Format the message for the client
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

        // Set room name for group
        roomName=`group_${targetId}`;

      } else {
        // For 1:1 messages
        const conversation=await this.chatService.getConversationWithUser(
          Number(senderId),
          targetId
        );

        // Save the message to the database
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

        // Set room name for 1:1 chat (recipient's personal room)
        roomName=`user_${targetId}`;
      }

      // Emit to the appropriate room (group or user)
      this.server.to(roomName).emit('newMessage', {
        ...messageData,
        isOwn: false
      });

      // Also send to sender in their personal room
      this.server.to(`user_${senderId}`).emit('newMessage', {
        ...messageData,
        isOwn: true
      });

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

      // Find or create group conversation for this role (only create if absolutely necessary)
      let groupConversation;
      try {
        console.log(`[GROUP CHAT] Looking for existing group conversation for role: ${role}`);
        groupConversation=await this.chatService.findGroupConversation(role, Number(senderId));

        if (!groupConversation) {
          console.log(`[GROUP CHAT] No existing conversation found, creating new one`);

          // Double-check: try to find any group conversation with this role name
          // This prevents race conditions where multiple users create the same group simultaneously
          try {
            // Use a more comprehensive search to avoid duplicates
            const allConversations=await this.chatService.getConversations(Number(senderId));
            const existingGroup=allConversations.find(conv =>
              conv.isGroup&&conv.groupName===groupName
            );

            if (existingGroup) {
              console.log(`[GROUP CHAT] Found existing group conversation during double-check: ${existingGroup.id}`);
              groupConversation=existingGroup;
            } else {
              // Create group conversation if it truly doesn't exist
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
            // Fallback to original creation logic
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

      // Save message to database
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

      // Broadcast to all users in the role room EXCEPT the sender
      const roleRoom=`role-${role}`;
      console.log(`[GROUP CHAT] Broadcasting to role room: ${roleRoom} (excluding sender ${senderId})`);

      // Get all sockets in the role room
      const socketsInRoom=await this.server.in(roleRoom).fetchSockets();
      console.log(`[GROUP CHAT] Found ${socketsInRoom.length} sockets in room ${roleRoom}`);
      console.log(`[GROUP CHAT] Sockets in room:`, socketsInRoom.map(s => ({ id: s.id, userId: this.connectedClients.get(s.id)?.userId })));

      // Send the message to all users in the role room except the sender
      for (const socket of socketsInRoom) {
        const socketUserId=this.connectedClients.get(socket.id)?.userId;
        if (String(socketUserId)!==String(senderId)) {
          // Only send to other users in the room, not the sender
          this.server.to(socket.id).emit('newMessage', {
            ...messageData,
            isOwn: false
          });
        }
      }

      // The sender's message is already handled optimistically in the frontend
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

      // Broadcast to the appropriate room
      if (isGroup&&role) {
        // For group chats, send to everyone in the role room except the sender
        client.to(`role-${role}`).emit('typing', {
          userId,
          username,
          isTyping,
          isGroup: true,
          role,
          timestamp: new Date().toISOString()
        });
      } else if (!isGroup) {
        // For 1:1 chats, send only to the recipient
        this.server.to(`user_${to}`).emit('typing', {
          userId,
          username,
          isTyping,
          isGroup: false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    // This event handler is for database-triggered events
    // Since we're handling real-time messaging directly in the socket handlers,
    // we can remove this to prevent duplicate messages
    console.log('Message created event received:', payload);
    // Optional: Handle any additional logic like notifications, logging, etc.
  }
}
