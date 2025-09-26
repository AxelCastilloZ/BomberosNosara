import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from './useAuth';

export interface UnreadMessage {
  id: string;
  content: string;
  senderId: string | number;
  senderName?: string;
  timestamp: Date;
  conversationId: string;
}

export const useChatNotifications = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  // Mark messages as read
  const markAsRead = useCallback((messageId?: string) => {
    setUnreadMessages(prev => {
      const updatedMessages = messageId 
        ? prev.filter(msg => msg.id !== messageId) // Remove single message
        : []; // Or clear all messages
      
      // Update count based on remaining messages
      setUnreadCount(updatedMessages.length);
      
      return updatedMessages;
    });
    
    // TODO: Send request to backend to mark messages as read
  }, []);

  // Handle new message
  const handleNewMessage = useCallback((message: any) => {
    
    const isNotFromCurrentUser = message.senderId !== user?.id;
    
 
    const isForCurrentUser = 
      
      (message.recipientId && message.recipientId === user?.id) ||
      
      (message.conversationId && message.recipients?.includes(user?.id));
    
    
    if (isNotFromCurrentUser && (isForCurrentUser || !message.recipientId)) {
      setUnreadMessages(prev => {
        const newMessage = {
          id: message.id || Date.now().toString(),
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName || 'Usuario',
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
          conversationId: message.conversationId,
          isGroup: !!message.conversationId
        };

        
        const updatedMessages = [
          newMessage,
          ...prev.filter(msg => 
            
            !(msg.conversationId && msg.conversationId === message.conversationId)
          )
        ].slice(0, 50); // Keep only the 50 most recent messages

        
        setUnreadCount(updatedMessages.length);
        
        // Notify user if the dropdown is closed
        if (!isDropdownOpen && window.Notification && Notification.permission === 'granted') {
          new Notification(`Nuevo mensaje de ${message.senderName || 'Usuario'}`, {
            body: message.content,
            icon: '/favicon.ico'
          });
        }
        
        return updatedMessages;
      });
    }
  }, [user?.id, isDropdownOpen]);

  // Fetch pending notifications from the server
  const fetchPendingNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Call your API to get unread messages
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat/unread-messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        setUnreadMessages(messages);
        setUnreadCount(messages.length);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Set up socket listeners and fetch initial notifications
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Fetch initial notifications
    fetchPendingNotifications();

    // Listen for new messages
    socket.on('newMessage', handleNewMessage);

    // Cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, user?.id, handleNewMessage, fetchPendingNotifications]);

  return { 
    unreadCount, 
    unreadMessages,
    isDropdownOpen,
    toggleDropdown,
    markAsRead,
    closeDropdown: () => setIsDropdownOpen(false)
  };
};
