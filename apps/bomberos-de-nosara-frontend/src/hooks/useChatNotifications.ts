import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from './useAuth';

export interface UnreadMessage {
  id: string;
  content: string;
  senderId: string|number;
  senderName?: string;
  timestamp: Date;
  conversationId: string;
}

export const useChatNotifications=() => {
  const { socket, isConnected }=useSocket();
  const { user }=useAuth();
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const [isDropdownOpen, setIsDropdownOpen]=useState(false);
  const [isLoading, setIsLoading]=useState(true);

  // Update unreadCount whenever unreadMessages changes
  const unreadCount=unreadMessages.length;

  // Toggle dropdown visibility
  const toggleDropdown=useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  // Update messages in state and mark as read in the database
  const updateUnreadMessages = useCallback(async (messages: UnreadMessage[]) => {
    try {
      // Update local state
      setUnreadMessages(messages);
      
      // If there are messages to mark as read, send to backend
      if (messages.length > 0) {
        await fetch(`${import.meta.env.VITE_API_URL||''}/api/chat/update-message-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            messageIds: messages.map(msg => msg.id),
            isRead: false
          })
        });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageId?: string) => {
    try {
      const messageIds = messageId 
        ? [messageId]
        : unreadMessages.map(msg => msg.id);

      // Update backend first
      await fetch(`${import.meta.env.VITE_API_URL||''}/api/chat/update-message-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageIds,
          isRead: true
        })
      });

      // Then update local state
      setUnreadMessages(prev => 
        messageId 
          ? prev.filter(msg => msg.id !== messageId)
          : []
      );

      // Notify via socket if needed
      if (socket) {
        socket.emit('markMessagesRead', { messageIds });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [socket, unreadMessages]);

  // Handle new message
  const handleNewMessage = useCallback((message: any) => {
    const isNotFromCurrentUser = message.senderId !== user?.id;
    const isForCurrentUser = 
      (message.recipientId && message.recipientId === user?.id) ||
      (message.conversationId && message.recipients?.includes(user?.id));

    if (isNotFromCurrentUser && (isForCurrentUser || !message.recipientId)) {
      setUnreadMessages(prev => {
        // Check if we already have this message (in case of duplicates)
        const messageExists = prev.some(msg => msg.id === message.id);
        if (messageExists) return prev;

        const newMessage = {
          id: message.id || Date.now().toString(),
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName || 'Usuario',
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
          conversationId: message.conversationId,
          isGroup: !!message.conversationId
        };

        // Add new message and remove any duplicates for the same conversation
        const updatedMessages = [
          newMessage,
          ...prev.filter(msg => 
            !(msg.conversationId && 
              msg.conversationId === message.conversationId && 
              msg.senderId === message.senderId)
          )
        ].slice(0, 50); // Keep only the 50 most recent messages

        // Update state and notify backend
        updateUnreadMessages(updatedMessages);

        // Show desktop notification if applicable
        if (!isDropdownOpen && window.Notification && Notification.permission === 'granted') {
          new Notification(`Nuevo mensaje de ${message.senderName || 'Usuario'}`,
            {
              body: message.content,
              icon: '/favicon.ico'
            }
          );
        }

        return updatedMessages;
      });
    }
  }, [user?.id, isDropdownOpen]);

  // Fetch pending notifications from the server
  const fetchPendingNotifications=useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      // Call your API to get unread messages
      const response=await fetch(`${import.meta.env.VITE_API_URL||''}/api/chat/unread-messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data=await response.json();
        const messages=data.messages||[];

        setUnreadMessages(messages);

      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch initial unread messages
  const fetchUnreadMessages = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/chat/unread-messages`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  }, [user?.id]);

  // Set up socket listeners and fetch initial notifications
  useEffect(() => {
    if (!socket || !user?.id) return;

    // Fetch initial unread messages
    fetchUnreadMessages();

    // Listen for new messages
    const onNewMessage = (message: any) => {
      handleNewMessage(message);
    };

    // Listen for messages read confirmation
    const onMessagesRead = (data: { messageIds: string[] }) => {
      if (data.messageIds) {
        setUnreadMessages(prev => 
          prev.filter(msg => !data.messageIds.includes(msg.id))
        );
      }
    };

    socket.on('newMessage', onNewMessage);
    socket.on('messagesRead', onMessagesRead);

    // Cleanup
    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('messagesRead', onMessagesRead);
    };
  }, [socket, user?.id, handleNewMessage, fetchUnreadMessages]);

  return {
    unreadCount,
    unreadMessages,
    isDropdownOpen,
    toggleDropdown,
    markAsRead,
    closeDropdown: () => setIsDropdownOpen(false)
  };
};
