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
import { RoleEnum, RoleLabels } from '../../../../types/role.enum';

type Timeout=ReturnType<typeof setTimeout>;

// API configuration
const API_URL='http://localhost:3000';

// Types
interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  roles: any[];
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
  const [isSending, setIsSending]=useState(false);
  const [conversationId, setConversationId]=useState<number|null>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers]=useState<Set<string>>(new Set());
  const [inputValue, setInputValue]=useState('');
  const typingTimeoutRef=useRef<Timeout|null>(null);
  const searchInputRef=useRef<HTMLInputElement>(null);

  // Memoized helper function to get users by role, excluding current user by default
  const getUsersByRole=useCallback((roleName: string, excludeCurrentUser=true): User[] => {
    if (!users) return [];

    return users.filter(user => {
      // Exclude current user if needed
      if (excludeCurrentUser&&user.id===currentUser?.id) return false;

      // Check if user has the specified role
      return user.roles?.some(role =>
        typeof role==='string'? role===roleName:role.name===roleName
      );
    });
  }, [users, currentUser?.id]);

  // Helper function to get user's display name
  const getUserDisplayName=(user: User): string => {
    return user.name||user.username||'Usuario sin nombre';
  };

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

  const handleSelectRoleGroup=async (role: RoleEnum) => {
    try {
      setIsLoading(true);
      // Get all users with this role (including current user for the API call)
      const roleUsers=getUsersByRole(role, false);
      const participantIds=roleUsers.map(user => user.id);

      // Create or get group conversation
      const response=await axios.post(`${API_URL}/chat/conversations/group`, {
        participantIds,
        groupName: RoleLabels[role]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const conversation=response.data;
      setConversationId(conversation.id);

      // Set the selected target with conversation details
      setSelectedTarget({
        id: conversation.id,
        name: conversation.groupName||RoleLabels[role],
        type: 'role',
        role
      });

      // If there are existing messages, load them
      if (conversation.messages?.length>0) {
        const formattedMessages=conversation.messages.map((msg: any) => ({
          ...msg,
          isOwn: msg.senderId===currentUser?.id,
          sender: {
            id: msg.senderId,
            username: msg.sender?.username||'Usuario'
          }
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }

      // Set up socket listeners for this conversation
      if (socket) {
        // Leave any previous room
        socket.emit('leaveConversation', { conversationId: conversationId });

        // Join the new conversation room
        socket.emit('joinConversation', {
          conversationId: conversation.id,
          userId: currentUser?.id
        });
      }

    } catch (error) {
      console.error('Error creating group conversation:', error);
      // Fallback to old behavior if API call fails
      setSelectedTarget({
        id: `role-${role}`,
        name: RoleLabels[role],
        type: 'role',
        role
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get or create group conversation
  const getOrCreateGroupConversation=useCallback(async (role: RoleEnum, groupName: string) => {
    try {
      const roleUsers=getUsersByRole(role, false);
      const participantIds=roleUsers.map(user => user.id);

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
  }, [token, getUsersByRole]);

  // Memoize the joinConversation function to prevent recreation on every render
  const joinConversation=useCallback(async (target: ChatTarget) => {
    if (!socket) return;

    try {
      setIsLoading(true);
      setMessages([]);

      const isGroup=target.type==='role';
      let conversationId=target.id;

      // For group conversations, get the actual conversation ID first
      if (isGroup&&target.role) {
        conversationId=await getOrCreateGroupConversation(
          target.role,
          target.name
        );
        if (conversationId) {
          setConversationId(Number(conversationId));
        }
      }
      console.log('CONVERSATION ID:', conversationId);

      // Join the conversation room
      socket.emit('joinConversation', {
        conversationId,
        isGroup
      }, (response: any) => {
        if (response?.error) {
          console.error('Error joining conversation:', response.error);
        }
      });

      // Get messages for the conversation
      const response=await axios.get(
        `${API_URL}/chat/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('RESPONSE:', response.data);

      const messages=response.data.map((msg: any) => ({
        ...msg,
        isOwn: msg.senderId===currentUser?.id||
          (msg.sender&&msg.sender.id===currentUser?.id),
        isGroup,
        groupId: isGroup? conversationId:undefined,
        sender: {
          id: msg.senderId||(msg.sender?.id||0),
          username: msg.sender?.username||'Usuario'
        }
      }));

      setMessages(messages);
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [socket, token, currentUser?.id, getOrCreateGroupConversation]);

  // Join conversation when a target is selected
  useEffect(() => {
    if (!selectedTarget) return;

    joinConversation(selectedTarget);
    console.log('SELECTED TARGET:', selectedTarget);
    // Clean up on unmount or when changing conversations
    return () => {
      if (socket&&selectedTarget) {
        socket.emit('leaveConversation', {
          conversationId: selectedTarget.id,
          isGroup: selectedTarget.type==='role'
        });
      }
    };
  }, [selectedTarget, joinConversation, socket]);

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
        const response=await axios.get<User[]>(`${API_URL}/chat/users/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        setFilteredUsers(response.data); // Initialize filtered users with all users
      } catch (err) {
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
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser, currentUser]);

  // Set up socket listeners for messages and typing indicators
  useEffect(() => {
    if (!socket||!isConnected||!currentUser) return;

    const handleNewMessage=(message: Message) => {
      console.log('New message received:', message);
      console.log('selectedTarget:', selectedTarget);
  
      // Check if the message is for the current conversation
      if (!selectedTarget) return;
  
      const isForCurrentConversation = 
        (selectedTarget.type === 'role' && message.isGroup && message.groupId === selectedTarget.id) ||
        (selectedTarget.type === 'user' && !message.isGroup && 
         (message.senderId === selectedTarget.id || message.to === selectedTarget.id));
  
      if (!isForCurrentConversation) return;
  
      // Prevent duplicate messages by checking if message already exists
      setMessages(prev => {
        const messageExists = prev.some(existingMsg => 
          existingMsg.id === message.id || 
          (existingMsg.content === message.content && 
           existingMsg.senderId === message.senderId && 
           Math.abs(new Date(existingMsg.timestamp || '').getTime() - new Date(message.timestamp || '').getTime()) < 1000)
        );
        
        if (messageExists) {
          console.log('Duplicate message detected, skipping:', message);
          return prev;
        }
        
        return [
          ...prev,
          {
            ...message,
            isOwn: message.isOwn !== undefined ? message.isOwn : 
                   (message.senderId === currentUser?.id || 
                    (message.sender && message.sender.id === currentUser?.id))
          }
        ];
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

    // Clean up function
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleUserTyping);
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

  const clearChatState=useCallback(() => {
    setSelectedTarget(null);
    setConversation(null);
    setMessages([]);
    setConversationId(null);
    setSearchQuery('');
    if (searchInputRef.current) searchInputRef.current.value='';
  }, [setSelectedTarget, setConversation, setMessages, setSearchQuery, searchInputRef]);

  // Handle sending a message
  const handleSendMessage=async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()||!selectedTarget||!socket||!currentUser) return;

    const isGroup=selectedTarget.type==='role';
    const targetId=selectedTarget.id;
    const senderId=currentUser.id;

    // Prepare message data for the API
    const messageData={
      to: isGroup ? conversationId:selectedTarget.id,
      message: inputValue,
      senderId: senderId,
      isGroup: isGroup,
      // Include conversationId for 1:1 chats if available
      ...(!isGroup&&{ conversationId: Number(conversationId) }),
      // Include recipient info for 1:1 chats
      ...(!isGroup&&{ to: targetId })
    };

    // Clear input immediately
    setInputValue('');

    try {
      // Send the message via WebSocket
      const eventName = isGroup ? 'sendToRole' : 'sendMessage';
      const socketData = isGroup ? {
        role: targetId,
        message: inputValue,
        senderId: senderId
      } : messageData;
      
      socket.emit(eventName, socketData, (response: any) => {
        if (response?.error) {
          console.error('Error sending message:', response.error);
          // Show error message or handle error state
        } else {
          console.log('Message sent successfully:', response);
        }
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

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
                {filteredUsers.map((user: User) => (
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
                          {user.roles?.join(', ')}
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
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <FiUser className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedTarget.name}
                    {selectedTarget.type==='role'&&(
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {(() => {
                          const roleUsers=getUsersByRole(selectedTarget.role!, false);
                          return `${roleUsers.length} ${roleUsers.length===1? 'miembro':'miembros'}`;
                        })()}
                      </span>
                    )}
                  </h2>
                  {typingUsers.size>0? (
                    <p className="text-xs text-gray-500">Escribiendo...</p>
                  ):selectedTarget.type==='role'? (
                    <div className="space-y-1">
                      {(() => {
                        const roleUsers=getUsersByRole(selectedTarget.role!);

                        if (roleUsers.length===0) {
                          return <p className="text-xs text-gray-600">No hay otros usuarios disponibles en este grupo</p>;
                        }

                        return (
                          <div className="text-xs text-gray-600">
                            {roleUsers.map((user, index) => (
                              <span key={user.id}>
                                {getUserDisplayName(user)}
                                {index<roleUsers.length-1? ', ':''}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ):null}
                </div>
              </div>
              <div className="flex items-center space-x-2">

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
                  {messages.length===0? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                      <FiMessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No hay mensajes</h3>
                      <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
                    </div>
                  ):(
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
