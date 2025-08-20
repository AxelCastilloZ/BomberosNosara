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

  async handleConnection(client: Socket) {
    try {
      console.log(`Client connecting: ${client.id}`);

      const token=this.getTokenFromSocket(client);
      if (!token) {
        console.log('No token provided');
        throw new UnauthorizedException('No token provided');
      }

      const jwt_secret=this.configService.get<string>('JWT_SECRET');
      const payload=this.jwtService.verify(token, { secret: jwt_secret });

      if (!payload) {
        console.log('Invalid token');
        throw new UnauthorizedException('Invalid token');
      }

      // Store minimal client data with role
      this.connectedClients.set(client.id, {
        userId: payload.sub,
        lastSeen: new Date(),
        role: payload.role
      });

      console.log(`Client connected: ${client.id}, User ID: ${payload.sub}`);

      // Join user's personal room for direct messages
      await client.join(`user_${payload.sub}`);

      // Join role-based room
      if (payload.role) {
        const roleRoom=`role-${payload.role}`;
        await client.join(roleRoom);
        console.log(`User ${payload.sub} joined role room: ${roleRoom}`);
      }

      client.emit('connected', {
        status: 'connected',
        clientId: client.id,
        userId: payload.sub,
        role: payload.role
      });

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

  handleDisconnect(client: Socket) {
    const clientData=this.connectedClients.get(client.id);
    if (clientData) {
      console.log(`Client disconnected: ${client.id}, User ID: ${clientData.userId}`);
      this.connectedClients.delete(client.id);

      // Leave all rooms
      client.rooms.forEach(room => client.leave(room));
    }
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
      const { to, message, senderId, isGroup = false } = data;
      console.log('Data:', data)
      console.log(`Sending message from ${senderId} to ${isGroup ? 'group' : 'user'} ${to}: ${message}`);

      if (!message) {
        throw new Error('Message content is required');
      }

      // Convert to number and validate
      const targetId = Number(to);
      console.log('Target ID:', targetId);
      if (isNaN(targetId)) {
        throw new Error(`Invalid ${isGroup ? 'group' : 'user'} ID: ${to}`);
      }

      let messageData;
      let roomName: string;

      if (isGroup) {
        // For group messages
        const conversation = await this.chatService.getConversationById(targetId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Verify user is a participant in the group
        const isParticipant = conversation.participants.some(p => p.id === Number(senderId));
        if (!isParticipant) {
          throw new Error('You are not a participant of this group');
        }

        // Save the message to the database
        const savedMessage = await this.chatService.createMessage({
          content: message,
          conversationId: conversation.id
        }, Number(senderId));

        // Format the message for the client
        messageData = {
          id: savedMessage.id,
          content: savedMessage.content,
          timestamp: savedMessage.createdAt.toISOString(),
          conversationId: savedMessage.conversation.id,
          isGroup: true,
          groupId: savedMessage.conversation.id,
          sender: {
            id: savedMessage.sender.id,
            username: savedMessage.sender.username || 'Usuario'
          }
        };

        // Set room name for group
        roomName = `group_${targetId}`;
        
      } else {
        // For 1:1 messages
        const conversation = await this.chatService.getConversationWithUser(
          Number(senderId),
          targetId
        );

        // Save the message to the database
        const savedMessage = await this.chatService.createMessage({
          content: message,
          conversationId: conversation.id,
          senderId: Number(senderId)
        }, Number(senderId));

        messageData = {
          id: savedMessage.id,
          content: savedMessage.content,
          senderId: savedMessage.sender.id,
          to: targetId,
          timestamp: savedMessage.createdAt.toISOString(),
          isGroup: false,
          sender: {
            id: savedMessage.sender.id,
            username: savedMessage.sender.username || 'Usuario'
          },
          conversationId: savedMessage.conversation.id
        };

        // Set room name for 1:1 chat (recipient's personal room)
        roomName = `user_${targetId}`;
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
        error: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }

  @SubscribeMessage('sendToRole')
  async handleRoleMessage(
    @MessageBody() data: RoleMessagePayload,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { role, message, senderId }=data;
      console.log(`Sending message to role ${role} from ${senderId}: ${message}`);

      if (!role||!message) {
        throw new Error('Role and message content are required');
      }

      // For group messages, we'll store them with a special conversation ID
      // In a real app, you might want to create a proper group conversation
      const messageData={
        id: Date.now(),
        content: message,
        senderId,
        to: role,
        timestamp: new Date().toISOString(),
        isGroup: true,
        groupId: role,
        sender: {
          id: senderId,
          username: 'Usuario' // TODO: Fetch from database
        }
      };

      // In a real app, you would save the group message to the database here
      // For example:
      // await this.chatService.saveGroupMessage({
      //   content: message,
      //   role: role,
      //   senderId: Number(senderId)
      // });

      // Broadcast to all users in the role room including sender
      this.server.to(`role-${role}`).emit('newMessage', messageData);

      // Also emit back to sender with isOwn flag
      client.emit('newMessage', {
        ...messageData,
        isOwn: true
      });

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
    const { isGroup, groupId, to, senderId }=payload;

    if (isGroup&&groupId) {
      // For group messages, send to the role room
      this.server.to(`role-${groupId}`).emit('newMessage', payload);
    } else if (to) {
      // For 1:1 messages, send to recipient
      this.server.to(`user_${to}`).emit('newMessage', {
        ...payload,
        isOwn: false
      });

      // And back to sender with isOwn flag
      if (senderId) {
        this.server.to(`user_${senderId}`).emit('newMessage', {
          ...payload,
          isOwn: true
        });
      }
    }
  }
}
