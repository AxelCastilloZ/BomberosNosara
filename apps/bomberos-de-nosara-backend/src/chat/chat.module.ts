import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([Conversation, Message, User]),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway, 
    ChatService, 
    JwtService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
