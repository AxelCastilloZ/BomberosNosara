import { RoleEnum } from '../../../../types/role.enum';

export type Timeout = ReturnType<typeof setTimeout>;

export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  roles: any[];
  online?: boolean;
  lastSeen?: string;
}

export interface ChatTarget {
  id: string|number;
  name: string;
  type: 'user'|'role';
  role?: RoleEnum;
}

export interface Message {
  id?: number;
  content: string;
  senderId: number|string;
  conversationId?: number;
  timestamp?: string;
  isRead?: boolean;
  isOwn?: boolean;
  isGroup?: boolean;
  groupId?: string|number;
  to?: string|number;
  error?: string;
  status?: string;
  sender?: {
    id: number;
    username: string;
  };
}

export interface Conversation {
  id: number;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleGroup {
  id: string;
  name: string;
  type: 'role';
  role: RoleEnum;
  userCount: number;
}
