import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  ParseIntPipe,
  Query,
  BadRequestException
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { User } from '../../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Request() req: { user: User },
    @Body() createConversationDto: CreateConversationDto
  ) {
    return this.chatService.createConversation(createConversationDto, req.user.id);
  }

  @Get('conversations')
  getConversations(@Request() req: { user: User }) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  getConversation(
    @Request() req: { user: User },
    @Param('id', ParseIntPipe) conversationId: number
  ) {
    return this.chatService.getConversation(conversationId, req.user.id);
  }

  @Post('messages')
  async createMessage(
    @Request() req: { user: User },
    @Body() createMessageDto: CreateMessageDto
  ) {
    // Ensure the sender ID matches the authenticated user
    if (createMessageDto.senderId !== req.user.id) {
      throw new BadRequestException('Sender ID does not match authenticated user');
    }
    
    return this.chatService.createMessage(createMessageDto, req.user.id);
  }

  @Get('conversations/:conversationId/messages')
  getMessages(
    @Request() req: { user: User },
    @Param('conversationId', ParseIntPipe) conversationId: number
  ) {
    return this.chatService.getMessages(conversationId, req.user.id);
  }

  @Post('conversations/with-user')
  async getOrCreateConversationWithUser(
    @Request() req: { user: User },
    @Body() body: { userId: number }
  ) {
    if (!body.userId) {
      throw new BadRequestException('User ID is required');
    }
    
    if (body.userId === req.user.id) {
      throw new BadRequestException('Cannot create a conversation with yourself');
    }
    
    return this.chatService.getConversationWithUser(req.user.id, body.userId);
  }

  @Get('users/available')
  async getAvailableUsers(@Request() req: { user: User }) {
    return this.chatService.getAvailableUsers(req.user.id);
  }
}
