import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  private connectedClients=new Map<string, { userId: string|number; lastSeen: Date }>();

  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {
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

      // Store minimal client data
      this.connectedClients.set(client.id, {
        userId: payload.sub,
        lastSeen: new Date()
      });

      console.log(`Client connected: ${client.id}, User ID: ${payload.sub}`);

      // Join a room for this user to target messages
      await client.join(`user_${payload.sub}`);

      client.emit('connected', {
        status: 'connected',
        clientId: client.id,
        userId: payload.sub
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
  async handleJoinConversation(client: Socket, data: { conversationId: string }) {
    const clientData=this.connectedClients.get(client.id);
    if (!clientData) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Leave any existing conversation rooms
    client.rooms.forEach(room => {
      if (room!==client.id&&room.startsWith('conversation_')) {
        client.leave(room);
      }
    });

    // Join the new conversation room
    await client.join(`conversation_${data.conversationId}`);
    console.log(`User ${clientData.userId} joined conversation ${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: any) {
    try {
      console.log('Received message from client:', client.id);

      const clientData=this.connectedClients.get(client.id);
      if (!clientData) {
        console.log('Client not authenticated');
        throw new UnauthorizedException('Not authenticated');
      }

      // Validate required fields
      if (!payload||typeof payload!=='object') {
        console.log('Invalid payload format');
        throw new Error('Invalid message format');
      }

      if (!payload.conversationId) {
        console.log('Missing conversationId in payload');
        throw new Error('conversationId is required');
      }

      if (typeof payload.content==='undefined'||payload.content===null) {
        console.log('Message content is required');
        throw new Error('Message content is required');
      }

      // Create message data with defaults
      const messageData={
        id: payload.id||Date.now().toString(),
        content: String(payload.content||''),
        conversationId: String(payload.conversationId),
        senderId: clientData.userId,
        createdAt: new Date().toISOString(),
        isRead: false,
        ...payload // Allow overriding any fields
      };

      console.log('Broadcasting message to conversation:', messageData.conversationId);

      try {
        // Emit to all clients in the conversation room (including the sender)
        this.server.to(`conversation_${messageData.conversationId}`).emit('newMessage', messageData);

        // Send confirmation back to the sender
        client.emit('messageSent', {
          ...messageData,
          status: 'delivered'
        });

        return { success: true, message: 'Message sent' };
      } catch (emitError) {
        console.error('Error emitting message:', emitError);
        throw new Error('Failed to send message');
      }

    } catch (error) {
      const errorMessage=error instanceof Error? error.message:'Unknown error';
      console.error('Error handling message:', error);

      // Only emit error to the client that sent the message
      client.emit('error', {
        message: 'Failed to send message',
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    this.server.emit('newMessage', payload);
  }
}
