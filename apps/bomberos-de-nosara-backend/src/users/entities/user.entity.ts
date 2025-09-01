import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToMany, 
  JoinTable, 
  OneToMany 
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { Message } from '../../chat/entities/message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })     
  email!: string;                  

  @Column()
  password!: string;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable()
  roles!: Role[];


  @ManyToMany(() => Conversation, conversation => conversation.participants)
  conversations!: Conversation[];

  @OneToMany(() => Message, message => message.sender)
  messages!: Message[];

 
  isParticipant(conversationId: number): boolean {
    if (!this.conversations) return false;
    return this.conversations.some(conv => conv.id === conversationId);
  }
}
