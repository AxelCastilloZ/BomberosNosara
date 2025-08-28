import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { WebSocketsGateway } from './web-sockets.gateway';

@Module({
  providers: [WebSocketsService, WebSocketsGateway],
  exports: [WebSocketsService],  // para inyectarlo en otros módulos
})
export class WebSocketsModule {}
