// src/hooks/useChatApi.ts
import { useCallback, useMemo } from 'react';
import axios, { type RawAxiosRequestHeaders } from 'axios';
import { useAuth } from './useAuth';
import type { User, Message, Conversation } from '../components/ui/Administrativa/ChatInterno/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function decodeJwt(token?: string): any | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useChatApi = () => {
  const { token } = useAuth();

  const headers = useMemo<RawAxiosRequestHeaders>(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // ✅ Current user desde el JWT (sin /auth/me)
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const claims = decodeJwt(token || undefined);
    if (!claims) return null;

    const userFromToken: User = {
      id: Number(claims.sub ?? claims.id ?? claims.userId ?? 0),
      username: claims.username ?? claims.name ?? 'usuario',
      email: claims.email,
      name: claims.name,
      roles: claims.roles ?? [],
    };

    return userFromToken;
  }, [token]);

  const fetchAvailableUsers = useCallback(async (): Promise<User[]> => {
    if (!token) return [];
    try {
      const { data } = await axios.get<User[]>(
        `${API_URL}/chat/users/available`,
        { headers }
      );
      return data;
    } catch (e) {
      console.error('Error fetching users:', e);
      return [];
    }
  }, [headers, token]);

  const getOrCreateGroupConversation = useCallback(
    async (participantIds: number[], groupName: string): Promise<number | undefined> => {
      if (!participantIds.length) return;
      const jsonHeaders: RawAxiosRequestHeaders = {
        ...headers,
        'Content-Type': 'application/json',
      };
      const { data } = await axios.post<{ id: number }>(
        `${API_URL}/chat/conversations/group`,
        { participantIds, groupName },
        { headers: jsonHeaders }
      );
      return data.id;
    },
    [headers]
  );

  const getConversationMessages = useCallback(
    async (conversationId: string | number): Promise<Message[]> => {
      try {
        const { data } = await axios.get<Message[]>(
          `${API_URL}/chat/conversations/${conversationId}/messages`,
          { headers }
        );
        return data;
      } catch (e) {
        console.error('Error fetching messages:', e);
        return [];
      }
    },
    [headers]
  );

  const findConversationWithUser = useCallback(
    async (userId: number): Promise<Conversation | null> => {
      try {
        const { data } = await axios.get<Conversation>(
          `${API_URL}/chat/conversations/with/${userId}`,
          { headers }
        );
        return data;
      } catch {
        return null;
      }
    },
    [headers]
  );

  return {
    fetchCurrentUser,
    fetchAvailableUsers,
    getOrCreateGroupConversation,
    getConversationMessages,
    findConversationWithUser,
  };
};
