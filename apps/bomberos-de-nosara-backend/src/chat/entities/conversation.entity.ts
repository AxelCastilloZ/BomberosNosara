import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['updatedAt'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => User, user => user.conversations, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants!: User[];

  @OneToMany(() => Message, message => message.conversation, { cascade: true })
  messages!: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'is_group', default: false })
  isGroup!: boolean;

  @Column({ name: 'group_name', nullable: true })
  groupName?: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  // Helper method to get the other participant in 1:1 chat
  getOtherParticipant(currentUserId: number): User|undefined {
    if (this.isGroup) {
      return undefined;
    }
    return this.participants.find(user => user.id !== currentUserId);
  }
}
