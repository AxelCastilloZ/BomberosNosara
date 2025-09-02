import { useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { User, Message, Conversation } from '../components/ui/Administrativa/ChatInterno/types';

// API configuration
const API_URL='http://localhost:3000';

export const useChatApi=() => {
    const { token }=useAuth();

    // Fetch current user data from localStorage
    const fetchCurrentUser=useCallback(async (userId: string): Promise<User|null> => {
        try {
            const response=await axios.get(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (err) {
            console.error('Error fetching current user:', err);
            return null;
        }
    }, [token]);

    const fetchAvailableUsers=useCallback(async (): Promise<User[]> => {
        if (!token) return [];

        try {
            const response=await axios.get<User[]>(`${API_URL}/chat/users/available`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            console.error('Error fetching users:', err);
            return [];
        }
    }, [token]);

    const getOrCreateGroupConversation=useCallback(async (
        participantIds: number[],
        groupName: string
    ): Promise<number|undefined> => {
        try {
            if (participantIds.length===0) {
                return;
            }
            const conversationResponse=await axios.post(
                `${API_URL}/chat/conversations/group`,
                {
                    participantIds,
                    groupName
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return conversationResponse.data.id;
        } catch (err) {
            console.error('Error getting/creating group conversation:', err);
            throw err;
        }
    }, [token]);

    const getConversationMessages=useCallback(async (conversationId: string|number): Promise<Message[]> => {
        try {
            const response=await axios.get(
                `${API_URL}/chat/conversations/${conversationId}/messages`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (err) {
            console.error('Error fetching messages:', err);
            return [];
        }
    }, [token]);

    const findConversationWithUser=useCallback(async (userId: number): Promise<Conversation|null> => {
        try {
            const response=await axios.get(`${API_URL}/chat/conversations/with/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            console.log('No existing conversation found, will create a new one');
            return null;
        }
    }, [token]);

    return {
        fetchCurrentUser,
        fetchAvailableUsers,
        getOrCreateGroupConversation,
        getConversationMessages,
        findConversationWithUser
    };
};
