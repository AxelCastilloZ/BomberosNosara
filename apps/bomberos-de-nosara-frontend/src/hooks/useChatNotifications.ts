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
  const { socket }=useSocket();
  const { user }=useAuth();
  const [unreadMessages, setUnreadMessages]=useState<UnreadMessage[]>([]);
  const [isDropdownOpen, setIsDropdownOpen]=useState(false);
  const [isLoading, setIsLoading]=useState(true);

  const unreadCount=unreadMessages.length;

  const toggleDropdown=useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const updateUnreadMessages=useCallback(async (messages: UnreadMessage[]) => {
    try {
      setUnreadMessages(prevMessages => {
        const existingMessages=new Map(prevMessages.map(msg => [msg.id, msg]));
        const mergedMessages=[
          ...messages,
          ...prevMessages.filter(msg => !messages.some(m => m.id===msg.id))
        ];

        return mergedMessages
          .sort((a, b) => new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime())
          .slice(0, 50);
      });

      if (messages.length>0) {
        const uniqueMessageIds=Array.from(new Set(messages.map(msg => msg.id)));
        await fetch(`${import.meta.env.VITE_API_URL||''}/chat/update-message-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            messageIds: uniqueMessageIds,
            isRead: false
          })
        });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, []);

  const markAsRead=useCallback(async (messageId?: string, conversationId?: string) => {
    if (!user?.id) return;

    try {
      if (messageId) {
        // Mark single message as read
        const response=await fetch(
          `${import.meta.env.VITE_API_URL||''}/chat/messages/${messageId}/mark-read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Failed to mark message as read');
        }

        // Update local state to remove the read message
        setUnreadMessages(prev => prev.filter(msg => msg.id!==messageId));
      } else if (conversationId) {
        // Mark all messages in conversation as read
        const response=await fetch(
          `${import.meta.env.VITE_API_URL||''}/chat/conversations/${conversationId}/mark-all-read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Failed to mark all messages as read');
        }

        // Update local state to remove all messages from this conversation
        setUnreadMessages(prev =>
          prev.filter(msg => msg.conversationId!==conversationId)
        );
      } else {
        // Fallback: mark all messages as read (for backward compatibility)
        const messageIds=unreadMessages.map(msg => msg.id);
        if (messageIds.length===0) return;

        await Promise.all(
          unreadMessages.map(msg =>
            fetch(`${import.meta.env.VITE_API_URL||''}/chat/messages/${msg.id}/mark-read`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              credentials: 'include'
            })
          )
        );

        setUnreadMessages([]);
      }

      // Emit socket event to notify other clients
      if (socket) {
        socket.emit('markMessagesRead', {
          messageId,
          conversationId,
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [socket, unreadMessages, user]);

  const handleNewMessage=useCallback((message: any) => {
    const isNotFromCurrentUser=message.senderId!==user?.id;
    const isForCurrentUser=
      (message.recipientId&&message.recipientId===user?.id)||
      (message.conversationId&&message.recipients?.includes(user?.id))||
      (message.role&&message.role===user?.role);

    if (isNotFromCurrentUser&&(isForCurrentUser||!message.recipientId)) {
      const newMessage: UnreadMessage={
        id: message.id||`temp-${Date.now()}`,
        content: message.content,
        senderId: message.senderId,
        senderName: message.senderName||'Usuario',
        timestamp: message.timestamp? new Date(message.timestamp):new Date(),
        conversationId: message.conversationId||message.role
      };

      setUnreadMessages(prev => {
        const filtered=prev.filter(msg =>
          !(msg.id===newMessage.id||
            (msg.conversationId===newMessage.conversationId&&
              msg.senderId===newMessage.senderId))
        );
        return [newMessage, ...filtered].slice(0, 50);
      });

      if (!isDropdownOpen&&window.Notification&&Notification.permission==='granted') {
        const notification=new Notification(
          `Nuevo mensaje de ${message.senderName||'Usuario'}`,
          {
            body: message.content,
            icon: '/favicon.ico',
            tag: `msg-${message.id||message.senderId}-${Date.now()}`
          }
        );

        notification.onclick=() => {
          window.focus();
          notification.close();
        };
      }
    }
  }, [user?.id, user?.role, isDropdownOpen]);

  const fetchUnreadMessages=useCallback(async () => {
    if (!user?.id) return;

    try {
      const response=await fetch(
        `${import.meta.env.VITE_API_URL||''}/chat/unreadMessages`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data=await response.json();

      if (data&&Array.isArray(data)) {
        const formattedMessages=data.map((msg: any) => ({
          id: msg.id||`temp-${Date.now()}`,
          content: msg.content,
          senderId: msg.senderId,
          senderName: msg.sender.username,
          timestamp: msg.createdAt? new Date(msg.createdAt):new Date(),
          conversationId: msg.conversationId||'direct'
        }));
        setUnreadMessages(formattedMessages);
      } else {
        setUnreadMessages([]);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      setUnreadMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!socket||!user?.id) return;

    let isMounted=true;
    setIsLoading(true);

    if (window.Notification&&Notification.permission!=='granted'&&Notification.permission!=='denied') {
      Notification.requestPermission();
    }

    const loadUnreadMessages=async () => {
      try {
        await fetchUnreadMessages();
      } catch (error) {
        console.error('Error loading unread messages:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUnreadMessages();

    const onNewMessage=(message: any) => {
      if (!isMounted) return;
      handleNewMessage(message);
    };

    const onMessagesRead=(data: { messageIds: string[], userId?: string|number }) => {
      if (!isMounted||!data.messageIds||(data.userId&&data.userId!==user?.id)) return;
      setUnreadMessages(prev => prev.filter(msg => !data.messageIds.includes(msg.id)));
    };

    const onMessageStatusUpdate=(data: { messageId: string, isRead: boolean }) => {
      if (!isMounted||!data.isRead) return;
      setUnreadMessages(prev => prev.filter(msg => msg.id!==data.messageId));
    };

    socket.on('newMessage', onNewMessage);
    socket.on('messagesRead', onMessagesRead);
    socket.on('messageStatusUpdate', onMessageStatusUpdate);

    return () => {
      isMounted=false;
      socket.off('newMessage', onNewMessage);
      socket.off('messagesRead', onMessagesRead);
      socket.off('messageStatusUpdate', onMessageStatusUpdate);
    };
  }, [socket, user?.id, handleNewMessage, fetchUnreadMessages]);

  const hasUnreadMessages=useCallback((conversationId?: string) => {
    if (!conversationId) return false;
    return unreadMessages.some(msg => msg.conversationId===conversationId);
  }, [unreadMessages]);

  return {
    unreadCount,
    unreadMessages: [...unreadMessages].sort(
      (a, b) => new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()
    ),
    isDropdownOpen,
    isLoading,
    toggleDropdown,
    markAsRead,
    closeDropdown: () => setIsDropdownOpen(false),
    hasUnreadMessages
  };
};
