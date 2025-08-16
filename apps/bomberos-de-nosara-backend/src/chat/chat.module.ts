import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
