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

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server=new Server();
  private connectedClients: Map<string, Socket>=new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    client.emit('connected', { status: 'connected', clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() payload: any) {
    // Broadcast the message to all connected clients
    this.server.emit('receiveMessage', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    this.server.emit('newMessage', payload);
  }
}
