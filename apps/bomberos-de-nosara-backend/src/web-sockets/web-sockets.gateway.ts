import {
  WebSocketGateway, WebSocketServer, OnGatewayInit,
  ConnectedSocket, SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketsService } from './web-sockets.service';

@WebSocketGateway({
  namespace: '/reports',   // cámbialo si quieres
  cors: { origin: '*', credentials: false },
})
export class WebSocketsGateway implements OnGatewayInit {
  @WebSocketServer() io!: Server;

  constructor(private readonly wsService: WebSocketsService) {}

  afterInit() {
    this.wsService.bindServer(this.io);
  }

  // prueba simple
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { now: Date.now() });
  }
}
