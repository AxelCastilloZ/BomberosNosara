import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { CreateGroupConversationDto } from '../dto/create-group-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createConversation(createConversationDto: CreateConversationDto, currentUserId: number): Promise<Conversation> {
    // Ensure we have exactly 2 participants for 1:1 chat
    if (createConversationDto.participantIds?.length!==1) {
      throw new Error('1:1 chat requires exactly two participants');
    }

    // Add current user to participants
    const participantIds=[...createConversationDto.participantIds, currentUserId];

    // Check if conversation already exists between these users
    const existingConversation=await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .groupBy('conversation.id')
      .having('COUNT(participant.id) = :count', { count: participantIds.length })
      .andHaving(
        'SUM(CASE WHEN participant.id IN (:...ids) THEN 1 ELSE 0 END) = :count',
        { ids: participantIds, count: participantIds.length }
      )
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // Find all participants
    const participants=await this.userRepository.findBy({
      id: In(participantIds)
    });

    if (participants.length!==participantIds.length) {
      throw new NotFoundException('One or more participants not found');
    }

    // Create new conversation
    const conversation=this.conversationRepository.create({
      participants,
    });

    return this.conversationRepository.save(conversation);
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('participant.id = :userId', { userId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async getConversation(conversationId: number, userId: number): Promise<Conversation> {
    const conversation=await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('conversation.id = :conversationId', { conversationId })
      .andWhere('participant.id = :userId', { userId })
      .orderBy('message.createdAt', 'ASC')
      .getOne();

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    return conversation;
  }

  async getConversationById(conversationId: number): Promise<Conversation> {
    const conversation=await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'messages', 'messages.sender'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async userHasAccessToConversation(userId: number, conversationId: number): Promise<boolean> {
    const count=await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('conversation.id = :conversationId', { conversationId })
      .andWhere('participant.id = :userId', { userId })
      .getCount();

    return count>0;
  }

  async getGroupConversations(userId: number): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('participant.id = :userId', { userId })
      .andWhere('conversation.isGroup = true')
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async createMessage(createMessageDto: CreateMessageDto, senderId: number): Promise<Message> {
    const { content, conversationId }=createMessageDto;
    const isGroup='isGroup' in createMessageDto? createMessageDto.isGroup:false;

    // Verify conversation exists and user is a participant
    const conversation=await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'participant')
      .where('conversation.id = :conversationId', { conversationId })
      .andWhere('participant.id = :senderId', { senderId })
      .getOne();

    if (!conversation) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    // Create and save message
    const message=this.messageRepository.create({
      content,
      conversation: { id: conversationId },
      sender: { id: senderId },
    });

    // Update conversation's updatedAt
    await this.conversationRepository.update(conversationId!, {
      updatedAt: new Date(),
    });

    return this.messageRepository.save(message);
  }

  async getMessages(conversationId: number, userId: number): Promise<Message[]> {
    const hasAccess=await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('conversation.id = :conversationId', { conversationId })
      .andWhere('participant.id = :userId', { userId })
      .getCount()>0;

    if (!hasAccess) {
      throw new ForbiddenException('Access to this conversation is denied');
    }

    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async getConversationWithUser(currentUserId: number, otherUserId: number): Promise<Conversation> {
    const conversation=await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant1', 'participant1.id = :currentUserId', { currentUserId })
      .innerJoin('conversation.participants', 'participant2', 'participant2.id = :otherUserId', { otherUserId })
      .where('conversation.isGroup = :isGroup', { isGroup: false })
      .getOne();
    console.log('Conversation:', conversation);
    if (conversation) {
      return conversation;
    }
    const participants=await this.userRepository.findBy({
      id: In([currentUserId, otherUserId])
    });

    const newConversation=this.conversationRepository.create({
      participants: participants,
    });

    return this.conversationRepository.save(newConversation);
  }

  /**
   * Get all users except the current user
   * @param currentUserId The ID of the current user to exclude
   * @returns List of users
   */
  async getAvailableUsers(currentUserId: number): Promise<User[]> {
    return this.userRepository.find({ select: ['id', 'username'] });
  }

  /**
   * Get all users with a specific role
   * @param roleName The role name to filter by
   * @returns List of users with the specified role
   */
  async getUsersByRole(roleName: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name = :roleName', { roleName })
      .select(['user.id', 'user.username'])
      .getMany();
  }

  /**
   * Find a group conversation by name and verify if the specified user is a participant
   * @param groupName - Name of the group conversation to find
   * @param userId - ID of the user to check for participation
   * @returns The conversation if found and user is a participant, otherwise undefined
   */
  async findGroupConversation(groupName: string, userId: number): Promise<Conversation|undefined> {
    // First find the conversation by group name
    const conversation=await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.isGroup = :isGroup', { isGroup: true })
      .andWhere('conversation.groupName = :groupName', { groupName })
      .getOne();

    if (!conversation) return undefined;

    // Then verify the user is a participant
    const isParticipant=await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('conversation.id = :conversationId', { conversationId: conversation.id })
      .andWhere('participant.id = :userId', { userId })
      .getCount()>0;

    return isParticipant? conversation:undefined;
  }

  /**
   * Mark all messages in a conversation as read for a specific user
   * @param conversationId The ID of the conversation
   * @param userId The ID of the user marking messages as read
   */
  async markMessagesAsRead(conversationId: number, userId: number): Promise<Message[]> {
    // First verify the user has access to this conversation
    const hasAccess = await this.userHasAccessToConversation(userId, conversationId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // First get the messages that will be marked as read
    const messagesToUpdate = await this.messageRepository.find({
      where: {
        conversation: { id: conversationId },
        sender: { id: Not(userId) },
        isRead: false
      },
      relations: ['sender']
    });

    if (messagesToUpdate.length === 0) {
      return [];
    }

    // Mark messages as read in the database
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('id IN (:...ids)', { ids: messagesToUpdate.map(m => m.id) })
      .execute();

    // Return the updated messages with isRead = true
    return messagesToUpdate.map(msg => ({
      ...msg,
      isRead: true
    }));
  }

  async createGroupConversation(
    createGroupDto: CreateGroupConversationDto,
    currentUserId: number
  ): Promise<Conversation> {
    // Get all participants including the current user
    const allParticipantIds=[...new Set([...createGroupDto.participantIds!, currentUserId])];

    // Find existing conversation with exact same participants
    const existingConversation=await this.findGroupConversation(createGroupDto.groupName!, currentUserId);
    if (existingConversation) {
      return existingConversation;
    }

    // Find all users to add to the conversation
    const participants=await this.userRepository.find({
      where: {
        id: In(allParticipantIds)
      }
    });

    if (participants.length!==allParticipantIds.length) {
      throw new NotFoundException('One or more participants not found');
    }

    // Create new group conversation
    const conversation=new Conversation();
    conversation.participants=participants;
    conversation.isGroup=true;
    conversation.groupName=createGroupDto.groupName;
    conversation.createdBy=currentUserId;

    return this.conversationRepository.save(conversation);
  }

  /**
   * Get unread messages for all conversations of a user
   * @param userId The ID of the user
   * @returns Array of unread messages with conversation and sender details
   */
  async getUnreadMessages(userId: number): Promise<Array<{
    id: number;
    content: string;
    createdAt: Date;
    conversationId: number;
    sender: {
      id: number;
      username: string;
    };
  }>> {
    // Get all conversations for the user
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant', 'participant.id = :userId', { userId })
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.sender.id != :userId', { userId })
      .andWhere('message.isRead = :isRead', { isRead: false })
      .select([
        'message.id',
        'message.content',
        'message.createdAt',
        'conversation.id',
        'sender.id',
        'sender.username'
      ])
      .orderBy('message.createdAt', 'DESC')
      .getRawMany();

    // Transform raw results to match the expected format
    return conversations.map(msg => ({
      id: msg.message_id,
      content: msg.message_content,
      createdAt: msg.message_createdAt,
      conversationId: msg.conversation_id,
      sender: {
        id: msg.sender_id,
        username: msg.sender_username
      }
    }));
  }

  async markAsRead(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation', 'conversation.participants', 'sender']
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user is a participant in the conversation
    const isParticipant = message.conversation.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Not authorized to mark this message as read');
    }

    // Only mark as read if not already read and the user is not the sender
    if (!message.isRead && message.sender.id !== userId) {
      message.isRead = true;
      return this.messageRepository.save(message);
    }

    return message;
  }

  async markAllAsRead(conversationId: number, userId: number): Promise<{ count: number }> {
    // Verify user is a participant in the conversation
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants']
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Not authorized to mark messages as read in this conversation');
    }

    // Mark all unread messages in the conversation as read
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.sender', 'sender')
      .update(Message)
      .set({ isRead: true })
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('sender.id != :userId', { userId })
      .andWhere('message.isRead = false')
      .execute();

    return { count: result.affected || 0 };
  }
}
