import { RoleEnum } from '../../../../types/role.enum';

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role?: RoleEnum;
  roles?: RoleEnum[];
  isOnline?: boolean;
  lastActiveAt?: string;
}

export interface Message {
  id: string | number;
  content: string;
  senderId: number;
  sender?: User;
  timestamp: string;
  isOwn?: boolean;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  conversationId?: string | number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  id: number;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  role?: RoleEnum;
}

export interface RoleGroup {
  id: string;
  name: string;
  type: 'role';
  role: RoleEnum;
  userCount: number;
}

export interface ChatTarget {
  id: string | number;
  name: string;
  type: 'user' | 'role';
  role?: RoleEnum;
  userCount?: number;
  isOnline?: boolean;
  lastActiveAt?: string;
}
