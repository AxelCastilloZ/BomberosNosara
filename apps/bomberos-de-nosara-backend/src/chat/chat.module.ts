import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [ChatGateway, JwtService],
  exports: [ChatGateway],
})
export class ChatModule { }
