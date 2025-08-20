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
      .orderBy('message.createdAt', 'DESC')
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
      .innerJoin('conversation.participants', 'participant')
      .groupBy('conversation.id')
      .having('COUNT(participant.id) = 2')
      .andHaving('SUM(CASE WHEN participant.id IN (:...ids) THEN 1 ELSE 0 END) = 2', {
        ids: [currentUserId, otherUserId],
      })
      .getOne();

    if (conversation) {
      return conversation;
    }

    // If no conversation exists, create a new one
    return this.createConversation(
      { participantIds: [otherUserId] },
      currentUserId
    );
  }

  /**
   * Get all users except the current user
   * @param currentUserId The ID of the current user to exclude
   * @returns List of users
   */
  async getAvailableUsers(currentUserId: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: Not(currentUserId),
      },
      select: ['id', 'username'],
    });
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
}
