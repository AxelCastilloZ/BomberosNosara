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
  server: Server=new Server();
  private connectedClients: Map<string, { socket: Socket; userId: string|number }>=new Map();

  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) { }

  async handleConnection(client: Socket) {
    try {
      const token=this.getTokenFromSocket(client);
      console.log('Token received:', token);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      const jwt_secret=this.configService.get<string>('JWT_SECRET');
      const payload=this.jwtService.verify(token, { secret: jwt_secret }); // verify JWT
      console.log('Authenticated user:', payload); if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      this.connectedClients.set(client.id, { socket: client, userId: payload.sub });
      console.log(`Client connected: ${client.id}, User ID: ${payload.sub}`);
      client.emit('connected', { status: 'connected', clientId: client.id, userId: payload.sub });
    } catch (error) {
      const errorMessage=error instanceof Error? error.message:'Unknown error';
      console.error('Connection error:', errorMessage);
      client.emit('error', { message: 'Authentication failed' });
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
    }
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, @MessageBody() payload: any) {
    const clientData=this.connectedClients.get(client.id);
    if (!clientData) {
      throw new UnauthorizedException('Not authenticated');
    }

    this.server.emit('receiveMessage', {
      ...payload,
      userId: clientData.userId,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    this.server.emit('newMessage', payload);
  }
}
