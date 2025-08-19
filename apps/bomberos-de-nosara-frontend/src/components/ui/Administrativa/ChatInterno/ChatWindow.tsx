import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useSocket } from '../../../../contexts/SocketContext';
import { useAuth } from '../../../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiUsers,
  FiMessageSquare,
  FiChevronLeft,
  FiLoader,
  FiPaperclip,
  FiImage,
  FiMoreVertical,
  FiSearch,
  FiCheckCircle,
  FiCheck
} from 'react-icons/fi';
import axios from 'axios';
import { RoleEnum } from '../../../../types/role.enum';

type Timeout=ReturnType<typeof setTimeout>;

// API configuration
const API_URL='http://localhost:3000';

// Types
interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  role: RoleEnum;
}

interface ChatTarget {
  id: string|number;
  name: string;
  type: 'user'|'role';
  role?: RoleEnum;
}

interface Message {
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
  const { token }=useAuth();
  const [currentUser, setCurrentUser]=useState<User|null>(null);

  // State
  const [users, setUsers]=useState<User[]>([]);
  const [filteredUsers, setFilteredUsers]=useState<User[]>([]);
  const [searchQuery, setSearchQuery]=useState('');
  const [selectedTarget, setSelectedTarget]=useState<ChatTarget|null>(null);
  const [showGroups, setShowGroups]=useState(true);
  const [conversation, setConversation]=useState<Conversation|null>(null);
  const [messages, setMessages]=useState<Message[]>([]);
  const [isLoading, setIsLoading]=useState(false);
  const [error, setError]=useState<string|null>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers]=useState<Set<string>>(new Set());
  const [inputValue, setInputValue]=useState('');
  const typingTimeoutRef=useRef<Timeout|null>(null);
  const searchInputRef=useRef<HTMLInputElement>(null);

  // Fetch current user data from localStorage
  useEffect(() => {
    const fetchCurrentUser=async () => {
      try {
        const currentUser=localStorage.getItem('authUser');
        if (currentUser) {
          const response=await axios.get(`${API_URL}/users/${currentUser}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('Error al cargar la información del usuario');
      }
    };

    if (token) {
      fetchCurrentUser();
    }
  }, [token]);
  console.log('cuurent Y:', currentUser)
  // Role groups for chat
  const roleGroups: ChatTarget[]=[
    {
      id: RoleEnum.SUPERUSER,
      name: 'Superusuarios',
      type: 'role',
      role: RoleEnum.SUPERUSER
    },
    {
      id: RoleEnum.ADMIN,
      name: 'Administradores',
      type: 'role',
      role: RoleEnum.ADMIN
    },
    {
      id: RoleEnum.PERSONAL_BOMBERIL,
      name: 'Personal Bomberil',
      type: 'role',
      role: RoleEnum.PERSONAL_BOMBERIL
    },
    {
      id: RoleEnum.VOLUNTARIO,
      name: 'Voluntarios',
      type: 'role',
      role: RoleEnum.VOLUNTARIO
    }
  ];

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query=searchQuery.toLowerCase();
      const filtered=users.filter(user =>
        user.username.toLowerCase().includes(query)||
        user.email?.toLowerCase().includes(query)||
        user.name?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

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
        setFilteredUsers(response.data); // Initialize filtered users with all users
      } catch (err) {
        setError('Error al cargar los usuarios');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Handle search input change
  const handleSearchChange=(e: React.ChangeEvent<HTMLInputElement>): void => {
    const value=e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setFilteredUsers(users);
    } else {
      const query=value.toLowerCase();
      const filtered=users.filter(
        user =>
          user.username.toLowerCase().includes(query)||
          (user.name&&user.name.toLowerCase().includes(query))||
          (user.email&&user.email.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  };

  // Clear search input
  const clearSearch=useCallback((): void => {
    setSearchQuery('');
    setFilteredUsers(users);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [users, setSearchQuery, setFilteredUsers]);

  const handleSelectUser=useCallback(async (user: User) => {
    console.log(user)
    console.log(currentUser)
    if (!token||!currentUser||!currentUser) {
      console.error('Missing required user data');
      return;
    }

    try {
      setIsLoading(true);
      setSelectedTarget({
        id: user.id,
        name: user.name||user.username||'Usuario',
        type: 'user'
      });
      setError(null);
      setSearchQuery(''); // Clear search when a user is selected

      // Try to find existing conversation
      try {
        const response=await axios.get(`${API_URL}/chat/conversations/with/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          console.log('Found existing conversation:', response.data);
          setConversation(response.data);

          // Fetch messages for this conversation
          try {
            const messagesResponse=await axios.get(
              `${API_URL}/chat/conversations/${response.data.id}/messages`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Fetched messages:', messagesResponse.data);
            setMessages(messagesResponse.data||[]);
          } catch (error) {
            console.error('Error fetching messages:', error);
          }
        }
      } catch (error) {
        console.log('No existing conversation found, will create a new one');
      }

    } catch (error) {
      console.error('Error in handleSelectUser:', error);
      setError('Error al cargar la conversación');
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser, currentUser]);

  // Set up socket listeners for messages and typing indicators
  useEffect(() => {
    if (!socket||!isConnected||!currentUser) return;

    const handleNewMessage=(message: Message) => {
      // Skip processing our own messages that we've already handled optimistically
      if (message.senderId===currentUser.id&&message.isOwn!==false) {
        return;
      }

      console.log('Received new message:', message);

      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        if (prevMessages.some(msg => msg.id===message.id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    };

    const handleUserTyping=(data: {
      userId: number|string;
      username: string;
      isTyping: boolean;
      isGroup?: boolean;
      groupId?: string|number;
      role?: string;
    }) => {
      // Skip our own typing indicators
      if (data.userId===currentUser.id) return;

      // Only process typing indicators for the current chat
      const isForCurrentChat=(
        // Group chat and this is for our current group
        (selectedTarget?.type==='role'&&data.isGroup&&data.role===selectedTarget.role)||
        // 1:1 chat and this is for our current conversation
        (selectedTarget?.type==='user'&&data.userId===selectedTarget.id&&!data.isGroup)
      );

      if (isForCurrentChat) {
        setTypingUsers(prev => {
          const newTypingUsers=new Set(prev);
          if (data.isTyping) {
            newTypingUsers.add(data.username);
          } else {
            newTypingUsers.delete(data.username);
          }
          return newTypingUsers;
        });
      }
    };

    // Set up event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleUserTyping);
    socket.on('message', handleNewMessage);

    // Clean up function
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleUserTyping);
      socket.off('message', handleNewMessage);
      setMessages([]);
    };
  }, [socket, isConnected, currentUser, selectedTarget]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange=useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value=e.target.value;
    setInputValue(value);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current=null;
    }

    // Only send typing indicator if we have content and a selected target
    if (value.trim()&&selectedTarget&&currentUser) {
      // Send typing indicator
      const typingData={
        to: selectedTarget.id,
        isTyping: true,
        isGroup: selectedTarget.type==='role',
        userId: currentUser.id,
        username: currentUser.username||'Usuario',
        role: selectedTarget.type==='role'? selectedTarget.role:undefined
      };

      socket?.emit('typing', typingData);

      // Set a timeout to stop the typing indicator after 1 second of inactivity
      typingTimeoutRef.current=setTimeout(() => {
        socket?.emit('typing', {
          ...typingData,
          isTyping: false
        });

        typingTimeoutRef.current=null;
      }, 1000);
    }
  }, [selectedTarget, currentUser, socket]);

  const handleBackToList=useCallback((): void => {
    setSelectedTarget(null);
    setConversation(null);
    setMessages([]);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [setSelectedTarget, setConversation, setMessages, setSearchQuery, searchInputRef]);

  // Handle sending a message
  const handleSendMessage=useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const messageContent=inputValue.trim();
    if (!messageContent||!socket||!selectedTarget||!currentUser||!currentUser) {
      console.log(currentUser)
      console.log(socket)
      console.log(selectedTarget)
      console.log(currentUser)
      console.error('Missing required data for sending message');
      return;
    }

    const tempMessageId=Date.now();
    const isGroupChat=selectedTarget.type==='role';

    // Create message data for the server
    const messageData={
      id: tempMessageId,
      content: messageContent,
      senderId: currentUser.id,
      to: selectedTarget.id,
      timestamp: new Date().toISOString(),
      isGroup: isGroupChat,
      groupId: isGroupChat? selectedTarget.id:undefined,
      sender: {
        id: currentUser.id,
        username: currentUser.username||'Usuario'
      }
    };

    // Optimistically add the message to the UI
    const tempMessage: Message={
      ...messageData,
      isOwn: true
    };

    // Add message to UI immediately
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setInputValue('');

    try {
      // Emit the message via WebSocket
      if (isGroupChat) {
        socket.emit(
          'sendToRole',
          {
            role: selectedTarget.role,
            message: messageContent,
            senderId: currentUser.id,
          },
          (response: { success: boolean; message?: any; error?: string }) => {
            if (!response.success) {
              console.error('Failed to send group message:', response.error||'Unknown error');
              // Update UI to show error state
              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id===tempMessageId
                    ? {
                      ...msg,
                      error: response.error||'Failed to send message',
                      status: 'error'
                    }
                    :msg
                )
              );
            }
          }
        );
      } else {
        socket.emit(
          'sendMessage',
          {
            to: selectedTarget.id,
            message: messageContent,
            senderId: currentUser.id,
            isGroup: false
          },
          (response: { success: boolean; message?: any; error?: string }) => {
            if (!response.success) {
              console.error('Failed to send message:', response.error||'Unknown error');
              // Update UI to show error state
              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id===tempMessageId
                    ? {
                      ...msg,
                      error: response.error||'Failed to send message',
                      status: 'error'
                    }
                    :msg
                )
              );
            }
          }
        );
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id===tempMessageId
            ? {
              ...msg,
              error: 'Error sending message',
              status: 'error'
            }
            :msg
        )
      );
    }
  }, [socket, selectedTarget, currentUser, currentUser, inputValue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiLoader className="animate-spin text-red-500 text-2xl" />
      </div>
    );
  }


  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          {selectedTarget&&(
            <button
              onClick={handleBackToList}
              className="mr-4 p-1 rounded-full hover:bg-red-700 transition-colors"
              aria-label="Volver a la lista"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold">Chat Interno</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full hover:bg-red-700 transition-colors"
            aria-label="Buscar"
            onClick={() => searchInputRef.current?.focus()}
          >
            <FiSearch className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-red-700 transition-colors"
            aria-label="Más opciones"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery&&(
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 font-medium text-sm ${showGroups? 'text-red-600 border-b-2 border-red-600':'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setShowGroups(true)}
            >
              Grupos
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm ${!showGroups? 'text-red-600 border-b-2 border-red-600':'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setShowGroups(false)}
            >
              Usuarios
            </button>
          </div>

          {/* User/Group List */}
          <div className="flex-1 overflow-y-auto">
            {showGroups? (
              <div className="divide-y divide-gray-100">
                {roleGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedTarget({
                        id: group.id,
                        name: group.name,
                        type: 'role',
                        role: group.role
                      });
                    }}
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <FiUsers className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                      <p className="text-sm text-gray-500 truncate">Grupo de chat</p>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  user.id!==currentUser?.id&&(
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name||user.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  )
                ))}
                {filteredUsers.length===0&&(
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedTarget? (
          <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <FiUser className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedTarget.name}</h2>
                  {typingUsers.size>0&&(
                    <p className="text-xs text-gray-500">Escribiendo...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  aria-label="Llamar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  aria-label="Videollamada"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  aria-label="Más opciones"
                >
                  <FiMoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ):(
                <div className="h-full flex flex-col">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                      <FiMessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No hay mensajes</h3>
                      <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((message, index) => {
                        const isOwn=message.sender?.id===currentUser?.id;
                        const username=isOwn? currentUser?.username||'Yo':message.sender?.username||'Usuario';

                        return (
                          <MessageBubble
                            key={message.id||index}
                            message={message.content}
                            isOwn={isOwn}
                            timestamp={message.timestamp||new Date().toISOString()}
                            username={username}
                          />
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="bg-gray-50 rounded-lg border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200 transition-all">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key==='Enter'&&!e.shiftKey) {
                        e.preventDefault();
                        const form=e.currentTarget.closest('form');
                        if (form) {
                          const formEvent={
                            ...e,
                            preventDefault: () => e.preventDefault(),
                            currentTarget: form as HTMLFormElement
                          } as unknown as React.FormEvent<HTMLFormElement>;
                          handleSendMessage(formEvent);
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => { }}
                    >
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => { }}
                    >
                      <FiImage className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-full text-white font-medium transition-colors ${inputValue.trim()? 'bg-red-600 hover:bg-red-700':'bg-gray-300 cursor-not-allowed'
                      }`}
                    disabled={!inputValue.trim()}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </form>
          </div>
        ):(
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <FiMessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bienvenido al chat</h3>
              <p className="text-gray-500 mb-6">Selecciona una conversación o inicia una nueva</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>Mensajes directos</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>Grupos por rol</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiCheckCircle className="text-green-500 mr-2" />
                  <span>Archivos e imágenes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ChatWindow;
