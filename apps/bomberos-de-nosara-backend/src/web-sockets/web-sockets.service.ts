import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WebSocketsService {
  private io?: Server;
  private readonly logger = new Logger(WebSocketsService.name);

  bindServer(io: Server) {
    this.io = io;
    this.logger.log('Socket.IO server bound to WebSocketsService');
  }

  emit(event: string, payload: unknown) {
    if (!this.io) return this.logger.warn(`emit(${event}) skipped: io not ready`);
    this.io.emit(event, payload);
  }
}
