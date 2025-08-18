import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useSocket } from '../../../../contexts/SocketContext';
import { useAuth } from '../../../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import { motion } from 'framer-motion';
import { FiUser, FiMessageSquare, FiChevronLeft, FiLoader } from 'react-icons/fi';
import axios from 'axios';

type Timeout=ReturnType<typeof setTimeout>;

// API configuration
const API_URL='http://localhost:3000';

// Types
interface User {
  id: number;
  username: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    username: string;
  };
}

interface Conversation {
  id: number;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const ChatWindow=() => {
  // Hooks
  const { socket, isConnected }=useSocket();
  const { token, user: currentUser }=useAuth();

  // State
  const [users, setUsers]=useState<User[]>([]);
  const [selectedUser, setSelectedUser]=useState<User|null>(null);
  const [conversation, setConversation]=useState<Conversation|null>(null);
  const [messages, setMessages]=useState<Message[]>([]);
  const [isLoading, setIsLoading]=useState(false);
  const [error, setError]=useState<string|null>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers]=useState<Set<string>>(new Set());
  const [inputValue, setInputValue]=useState('');
  const typingTimeoutRef=useRef<Timeout|null>(null);

  // Fetch available users
  useEffect(() => {
    const fetchUsers=async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response=await axios.get(`${API_URL}/chat/users/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError('Error al cargar los usuarios');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Fetch or create conversation when a user is selected
  const handleSelectUser=useCallback(async (user: User) => {
    if (!token||!currentUser) return;

    try {
      setIsLoading(true);
      setSelectedUser(user);

      // Try to find existing conversation
      const response=await axios.get(`${API_URL}/chat/conversations/with/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setConversation(response.data);
        setMessages(response.data.messages||[]);
      } else {
        // Create new conversation if none exists
        const newConvResponse=await axios.post(
          `${API_URL}/chat/conversations`,
          { participantIds: [user.id] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversation(newConvResponse.data);
        setMessages([]);
      }
    } catch (err) {
      setError('Error al cargar la conversación');
      console.error('Error fetching conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser]);

  // Handle sending a new message
  const handleSendMessage=useCallback(async (content: string) => {
    if (!socket||!content.trim()||!conversation||!currentUser) return;

    const newMessage: Message={
      id: Date.now(), // Temporary ID, will be replaced by server
      content,
      senderId: currentUser.id,
      conversationId: conversation.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: {
        id: currentUser.id,
        username: currentUser.username||'Usuario',
      },
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Send message to server
      const response=await axios.post(
        `${API_URL}/chat/messages`,
        { content, conversationId: conversation.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update message with server data
      setMessages((prev) =>
        prev.map((m) => (m.id===newMessage.id? { ...response.data, sender: newMessage.sender }:m))
      );

      // Emit socket event
      if (socket) {
        socket.emit('sendMessage', {
          ...response.data,
          sender: newMessage.sender,
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Revert optimistic update on error
      setMessages((prev) => prev.filter((m) => m.id!==newMessage.id));
      setError('Error al enviar el mensaje');
    }
  }, [socket, conversation, currentUser, token]);

  // Handle going back to user list
  const handleBackToList=useCallback(() => {
    setSelectedUser(null);
    setConversation(null);
    setMessages([]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket||!isConnected||!conversation) return;

    const handleNewMessage=(message: Message) => {
      if (message.conversationId===conversation.id) {
        setMessages((prev: Message[]) => [...prev, message]);
      }
    };

    const handleUserTyping=(data: { userId: number; username: string; isTyping: boolean }) => {
      setTypingUsers((prev: Set<string>) => {
        const newTypingUsers=new Set(prev);
        if (data.isTyping) {
          newTypingUsers.add(data.username);
        } else {
          newTypingUsers.delete(data.username);
        }
        return newTypingUsers;
      });
    };

    // Join conversation room
    socket.emit('joinConversation', { conversationId: conversation.id });

    // Set up event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleUserTyping);

    // Clean up
    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
        socket.off('typing', handleUserTyping);
        socket.emit('leaveConversation', { conversationId: conversation.id });
      }
    };
  }, [socket, isConnected, conversation]);

  // Handle input change
  const handleInputChange=(e: React.ChangeEvent<HTMLInputElement>) => {
    const value=e.target.value;
    setInputValue(value);

    // Notify other users that we're typing
    if (socket&&conversation&&currentUser?.username) {
      socket.emit('typing', {
        conversationId: conversation.id,
        username: currentUser.username,
        isTyping: value.length>0
      });
    }
  };

  // Handle typing indicator
  const handleTyping=useCallback(() => {
    if (!socket||!conversation||!currentUser?.username) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Notify other users that this user is typing
    socket.emit('typing', {
      conversationId: conversation.id,
      username: currentUser.username,
      isTyping: true,
    });

    // Set a timeout to stop the typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current=setTimeout(() => {
      socket.emit('typing', {
        conversationId: conversation.id,
        username: currentUser.username,
        isTyping: false,
      });
    }, 3000);
  }, [socket, conversation, currentUser]);

  if (isLoading&&!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiLoader className="animate-spin text-blue-500 text-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Chat Interno</h2>
        {selectedUser&&(
          <button
            onClick={handleBackToList}
            className="md:hidden text-white hover:text-gray-200"
          >
            <FiChevronLeft className="text-xl" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* User List */}
        {!selectedUser? (
          <div className="w-full md:w-1/3 border-r bg-white overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-700">Usuarios</h3>
            </div>
            {isLoading? (
              <div className="flex items-center justify-center h-32">
                <FiLoader className="animate-spin text-blue-500" />
              </div>
            ):error? (
              <div className="p-4 text-red-500">{error}</div>
            ):(
              <div className="divide-y">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiUser className="text-blue-500" />
                    </div>
                    <span>{user.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ):(
          /* Chat Window */
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center">
              <button
                onClick={handleBackToList}
                className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FiUser className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedUser.username}</h3>
                  <div className="text-xs text-gray-500">
                    {isConnected? 'En línea':'Desconectado'}
                    {typingUsers.size>0&&(
                      <span className="ml-2 text-blue-500">
                        {Array.from(typingUsers).join(', ')} está escribiendo...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length===0? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center"
                >
                  <FiMessageSquare size={48} className="mb-4 opacity-30" />
                  <h3 className="text-lg font-medium">No hay mensajes recientes</h3>
                  <p className="text-sm mt-1">Envía un mensaje para comenzar la conversación</p>
                </motion.div>
              ):(
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message.content}
                    isOwn={message.senderId===currentUser?.id}
                    timestamp={message.createdAt}
                    username={message.sender?.username||'Usuario'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleTyping}
                  onKeyPress={(e) => {
                    if (e.key==='Enter'&&!e.shiftKey) {
                      e.preventDefault();
                      if (inputValue.trim()) {
                        handleSendMessage(inputValue.trim());
                        setInputValue('');
                      }
                    }
                  }}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    if (inputValue.trim()) {
                      handleSendMessage(inputValue.trim());
                      setInputValue('');
                    }
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatWindow;
