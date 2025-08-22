import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useSocket } from '../../../../contexts/SocketContext';
import { useAuth } from '../../../../hooks/useAuth';
import { useChatApi } from '../../../../hooks/useChatApi';
import MessageBubble from './MessageBubble';
import {
  FiUser,
  FiUsers,
  FiMessageSquare,
  FiChevronLeft,
  FiLoader,
  FiMoreVertical,
  FiSearch,
  FiCheckCircle,
} from 'react-icons/fi';
import { RoleEnum, RoleLabels } from '../../../../types/role.enum';
import { Timeout, User, ChatTarget, Message, Conversation } from './types';




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

const ChatWindow=() => {

  const { socket, isConnected }=useSocket();
  const { token }=useAuth();
  const {
    fetchCurrentUser,
    fetchAvailableUsers,
    getOrCreateGroupConversation,
    getConversationMessages,
    findConversationWithUser
  }=useChatApi();
  const [currentUser, setCurrentUser]=useState<User|null>(null);


  const [users, setUsers]=useState<User[]>([]);
  const [filteredUsers, setFilteredUsers]=useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds]=useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery]=useState('');
  const [selectedTarget, setSelectedTarget]=useState<ChatTarget|null>(null);
  const [showGroups, setShowGroups]=useState(true);
  const [conversation, setConversation]=useState<Conversation|null>(null);
  const [messages, setMessages]=useState<Message[]>([]);
  const [isLoading, setIsLoading]=useState(false);
  const [conversationId, setConversationId]=useState<number|null>(null);
  const [typingUsers, setTypingUsers]=useState<Set<string>>(new Set());
  const [inputValue, setInputValue]=useState('');
  const typingTimeoutRef=useRef<Timeout|null>(null);
  const searchInputRef=useRef<HTMLInputElement>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);
  const messagesContainerRef=useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTarget]);

  const getUsersByRole=useCallback((roleName: string, excludeCurrentUser=true): User[] => {
    if (!users) return [];

    return users.filter(user => {

      if (excludeCurrentUser&&user.id===currentUser?.id) return false;

      // SUPERUSER is automatically a member of all groups
      const isSuperUser = user.roles?.some(role =>
        typeof role==='string'? role===RoleEnum.SUPERUSER:role.name===RoleEnum.SUPERUSER
      );
      
      if (isSuperUser) return true;

      return user.roles?.some(role =>
        typeof role==='string'? role===roleName:role.name===roleName
      );
    });
  }, [users, currentUser?.id]);

  // Check if current user has a specific role
  const currentUserHasRole = useCallback((roleName: string): boolean => {
    if (!currentUser?.roles) return false;
    return currentUser.roles.some(role => 
      typeof role === 'string' ? role === roleName : role.name === roleName
    );
  }, [currentUser?.roles]);

  // Check if current user is SUPERUSER
  const isSuperUser = useCallback((): boolean => {
    return currentUserHasRole(RoleEnum.SUPERUSER);
  }, [currentUserHasRole]);

  // Filter visible groups based on requirements
  const getVisibleGroups = useCallback((): ChatTarget[] => {
    return roleGroups.filter(group => {
      // Get users with this role (including current user for count)
      const roleUsers = getUsersByRole(group.role as string, false);
      
      // Group must have at least 2 members to be visible
      if (roleUsers.length < 2) {
        return false;
      }
      
      // SUPERUSER can see all groups
      if (isSuperUser()) {
        return true;
      }
      
      // Non-SUPERUSER can only see groups where they have the same role
      return currentUserHasRole(group.role as string);
    });
  }, [roleGroups, getUsersByRole, isSuperUser, currentUserHasRole]);


  const getUserDisplayName=(user: User): string => {
    if (user.id===currentUser?.id) return 'Tú';
    return user.name||user.username||'Usuario';
  };


  useEffect(() => {
    const loadCurrentUser=async () => {
      try {
        const currentUserId=localStorage.getItem('authUser');
        if (currentUserId) {
          const userData=await fetchCurrentUser(currentUserId);
          if (userData) {
            setCurrentUser(userData);
          }
        }
      } catch (err) {

      }
    };

    if (token) {
      loadCurrentUser();
    }
  }, [token, fetchCurrentUser]);

  const handleGetOrCreateGroupConversation=useCallback(async (role: RoleEnum, groupName: string) => {
    try {
      const roleUsers=getUsersByRole(role, false);
      const participantIds=roleUsers.map(user => user.id);
      
      // Ensure all SUPERUSER are included in the conversation
      const superUsers = users.filter(user => 
        user.roles?.some(userRole =>
          typeof userRole==='string'? userRole===RoleEnum.SUPERUSER:userRole.name===RoleEnum.SUPERUSER
        ) && !participantIds.includes(user.id)
      );
      
      participantIds.push(...superUsers.map(user => user.id));
      
      if (participantIds.length===0) {
        return null;
      }
      return await getOrCreateGroupConversation(participantIds, groupName);
    } catch (err) {

      throw err;
    }
  }, [getUsersByRole, getOrCreateGroupConversation, users]);

  const joinConversation=useCallback(async (target: ChatTarget) => {
    if (!socket||!target) return;

    if (selectedTarget?.id===target.id&&selectedTarget?.type===target.type) {
      return;
    }

    setIsLoading(true);
    setMessages([]);

    try {
      const isGroup=target.type==='role';
      let conversationId=null;

      if (isGroup&&target.role) {
        const groupConversationId=await handleGetOrCreateGroupConversation(
          target.role,
          RoleLabels[target.role]
        );
        if (groupConversationId) {
          conversationId=groupConversationId;
          setConversationId(Number(groupConversationId));
        }
      }

      if (!conversationId) {

        return;
      }

      const joinPromise=new Promise<void>((resolve) => {
        socket.emit('joinConversation', {
          conversationId,
          isGroup
        }, (response: any) => {
          if (response?.error) {

          }
          resolve();
        });
      });
      if (conversationId) {
        const [messagesData]=await Promise.all([
          getConversationMessages(conversationId),
          joinPromise
        ]);

        const processedMessages=messagesData
          .map((msg: any) => ({
            ...msg,
            isOwn: msg.senderId===currentUser?.id||
              (msg.sender&&msg.sender.id===currentUser?.id),
            isGroup,
            groupId: isGroup? conversationId:undefined,
            sender: {
              id: msg.senderId||(msg.sender?.id||0),
              username: msg.sender?.username||'Usuario'
            },
            timestamp: msg.timestamp||new Date().toISOString()
          }))
          .sort((a: Message, b: Message) =>
            new Date(a.timestamp||0).getTime()-new Date(b.timestamp||0).getTime()
          );

        setMessages(processedMessages);
        setSelectedTarget(target);
      }
    } catch (err) {

    } finally {
      setIsLoading(false);
    }
  }, [socket, token, currentUser?.id, handleGetOrCreateGroupConversation, selectedTarget, getConversationMessages]);

  useEffect(() => {
    if (!selectedTarget) return;

    const currentTarget=selectedTarget;
    joinConversation(currentTarget);

    return () => {
      if (socket&&currentTarget) {
        socket.emit('leaveConversation', {
          conversationId: currentTarget.id,
          isGroup: currentTarget.type==='role'
        });
      }
    };
  }, [selectedTarget, joinConversation, socket]);

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

  useEffect(() => {
    const loadUsers=async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const usersData=await fetchAvailableUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {

      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [token, fetchAvailableUsers]);

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

  const clearSearch=useCallback((): void => {
    setSearchQuery('');
    setFilteredUsers(users);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [users, setSearchQuery, setFilteredUsers]);

  const handleSelectUser=useCallback(async (user: User) => {

    if (!token||!currentUser||!currentUser) {

      return;
    }

    try {
      setIsLoading(true);
      setSelectedTarget({
        id: user.id,
        name: user.name||user.username||'Usuario',
        type: 'user'
      });
      setSearchQuery('');

      try {
        const conversationData=await findConversationWithUser(user.id);

        if (conversationData) {

          setConversation(conversationData);

          try {
            const messagesData=await getConversationMessages(conversationData.id);

            setMessages(messagesData||[]);
          } catch (error) {

          }
        }
      } catch (error) {

      }

    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser, findConversationWithUser, getConversationMessages]);

  const updateUserOnlineStatus=(userId: number, isOnline: boolean) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id===userId? { ...user, online: isOnline, lastSeen: isOnline? new Date().toISOString():user.lastSeen }:user
      )
    );

    setFilteredUsers(prevUsers =>
      prevUsers.map(user =>
        user.id===userId? { ...user, online: isOnline, lastSeen: isOnline? new Date().toISOString():user.lastSeen }:user
      )
    );

    setOnlineUserIds(prev => {
      const newSet=new Set(prev);
      if (isOnline) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleUserOnline=useCallback((data: { userId: number; status: 'online'|'offline' }) => {
    updateUserOnlineStatus(data.userId, data.status==='online');
  }, [updateUserOnlineStatus]);
  const handleOnlineUsers=useCallback((userIds: number[]) => {
    setOnlineUserIds(prevIds => {
      const newIds=new Set(userIds);
      if (prevIds.size!==newIds.size||
        !Array.from(prevIds).every(id => newIds.has(id))) {
        setUsers(prevUsers =>
          prevUsers.map(user => ({
            ...user,
            online: newIds.has(user.id)
          }))
        );
        return newIds;
      }
      return prevIds;
    });

    setFilteredUsers(prevUsers =>
      prevUsers.map(user => ({
        ...user,
        online: userIds.includes(user.id)
      }))
    );
  }, [setUsers, setFilteredUsers]);

  const handleNewMessage=useCallback((message: Message) => {
    if (!selectedTarget) return;

    const isForCurrentConversation=
      (selectedTarget.type==='role'&&message.isGroup&&
        (message.groupId===selectedTarget.role||message.groupId===selectedTarget.id))||
      (selectedTarget.type==='user'&&!message.isGroup&&
        (message.senderId===selectedTarget.id||message.to===selectedTarget.id))||
      (selectedTarget.type==='role'&&message.isGroup&&message.conversationId===conversationId);

    if (!isForCurrentConversation) return;

    setMessages(prev => {
      const messageExists=prev.some(existingMsg =>
        existingMsg.id===message.id||
        (existingMsg.content===message.content&&
          existingMsg.senderId===message.senderId&&
          Math.abs(new Date(existingMsg.timestamp||'').getTime()-new Date(message.timestamp||'').getTime())<1000)
      );

      if (messageExists) return prev;

      const newMessages=[
        ...prev,
        {
          ...message,
          isOwn: message.isOwn!==undefined? message.isOwn:
            (message.senderId===currentUser?.id||
              (message.sender&&message.sender.id===currentUser?.id)),
          timestamp: message.timestamp||new Date().toISOString()
        }
      ];

      return newMessages.sort((a, b) =>
        new Date(a.timestamp||0).getTime()-new Date(b.timestamp||0).getTime()
      );
    });
  }, [selectedTarget, conversationId, currentUser?.id]);

  const handleUserTyping=useCallback((data: {
    userId: number|string;
    username: string;
    isTyping: boolean;
    isGroup?: boolean;
    groupId?: string|number;
    role?: string;
  }) => {
    if (data.userId===currentUser?.id) return;

    const isForCurrentChat=(
      (selectedTarget?.type==='role'&&data.isGroup&&data.role===selectedTarget.role)||
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
  }, [currentUser?.id, selectedTarget]);

  useEffect(() => {
    if (!socket||!isConnected||!currentUser) return;

    socket.on('userStatus', handleUserOnline);
    socket.on('onlineUsers', handleOnlineUsers);

    socket.emit('getOnlineUsers');

    const handleNewMessage=(message: Message) => {


      if (!selectedTarget) {

        return;
      }

      const isForCurrentConversation=
        (selectedTarget.type==='role'&&message.isGroup&&
          (message.groupId===selectedTarget.role||message.groupId===selectedTarget.id))||
        (selectedTarget.type==='user'&&!message.isGroup&&
          (message.senderId===selectedTarget.id||message.to===selectedTarget.id))||
        (selectedTarget.type==='role'&&message.isGroup&&message.conversationId===conversationId);



      if (!isForCurrentConversation) {

        return;
      }

      setMessages(prev => {
        const messageExists=prev.some(existingMsg =>
          existingMsg.id===message.id||
          (existingMsg.content===message.content&&
            existingMsg.senderId===message.senderId&&
            Math.abs(new Date(existingMsg.timestamp||'').getTime()-new Date(message.timestamp||'').getTime())<1000)
        );

        if (messageExists) {

          return prev;
        }

        const newMessages=[
          ...prev,
          {
            ...message,
            isOwn: message.isOwn!==undefined? message.isOwn:
              (message.senderId===currentUser?.id||
                (message.sender&&message.sender.id===currentUser?.id)),
            timestamp: message.timestamp||new Date().toISOString()
          }
        ];

        return newMessages.sort((a, b) =>
          new Date(a.timestamp||0).getTime()-new Date(b.timestamp||0).getTime()
        );
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
      if (data.userId===currentUser.id) return;

      const isForCurrentChat=(
        (selectedTarget?.type==='role'&&data.isGroup&&data.role===selectedTarget.role)||
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

    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleUserTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageError', handleMessageError);
    socket.on('userStatus', handleUserOnline);
    socket.on('onlineUsers', handleOnlineUsers);

    socket.emit('getOnlineUsers');

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleUserTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messageSent', handleMessageSent);
      socket.off('messageError', handleMessageError);
      socket.off('userStatus', handleUserOnline);
      socket.off('onlineUsers', handleOnlineUsers);
    };
  }, [socket, isConnected, currentUser, selectedTarget, conversationId, token, joinConversation]);


  const handleMessageSent=useCallback((data: { message: Message }) => {

  }, []);


  const handleMessageError=useCallback((error: { message: string }) => {

  }, []);


  const handleStopTyping=useCallback((data: { userId: number|string; username: string }) => {
    setTypingUsers(prev => {
      const newTypingUsers=new Set(prev);
      newTypingUsers.delete(data.username);
      return newTypingUsers;
    });
  }, []);


  const handleInputChange=useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value=e.target.value;
    setInputValue(value);


    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current=null;
    }


    if (value.trim()&&selectedTarget&&currentUser) {

      const typingData={
        to: selectedTarget.id,
        isTyping: true,
        isGroup: selectedTarget.type==='role',
        userId: currentUser.id,
        username: currentUser.username||'Usuario',
        role: selectedTarget.type==='role'? selectedTarget.role:undefined
      };

      socket?.emit('typing', typingData);


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


  const handleSendMessage=async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()||!selectedTarget||!socket||!currentUser) return;

    const isGroup=selectedTarget.type==='role';

    const targetId=selectedTarget.id;
    const senderId=currentUser.id;


    const messageData={
      to: isGroup? conversationId:selectedTarget.id,
      message: inputValue,
      senderId: senderId,
      isGroup: isGroup,

      ...(!isGroup&&{ conversationId: Number(conversationId) }),

      ...(!isGroup&&{ to: targetId })
    };


    setInputValue('');

    try {

      if (isGroup) {

        const groupMessageData={
          role: selectedTarget.role!, // Use the actual role enum value, not the display label
          message: inputValue,
          senderId: senderId,
          groupName: RoleLabels[selectedTarget.role!]
        };



        const optimisticMessage: Message={
          id: Date.now(), // Temporary ID
          content: inputValue,
          senderId: senderId,
          timestamp: new Date().toISOString(),
          isOwn: true,
          isGroup: true,
          groupId: RoleLabels[selectedTarget.role!],
          sender: {
            id: senderId,
            username: 'Tú'
          }
        };


        setMessages(prev => {
          const newMessages=[
            ...prev,
            {
              ...optimisticMessage,
              timestamp: optimisticMessage.timestamp||new Date().toISOString()
            }
          ];
          return newMessages.sort((a, b) =>
            new Date(a.timestamp||0).getTime()-new Date(b.timestamp||0).getTime()
          );
        });

        socket.emit('sendToRole', groupMessageData, (response: any) => {
          if (response?.error) {


            setMessages(prev => prev.filter(msg => msg.id!==optimisticMessage.id));
          } else {


            if (response.message) {
              setMessages(prev => {
                const updatedMessages=prev.map(msg =>
                  msg.id===optimisticMessage.id
                    ? {
                      ...response.message,
                      isOwn: true,
                      timestamp: response.message.timestamp||new Date().toISOString()
                    }
                    :{
                      ...msg,
                      timestamp: msg.timestamp||new Date().toISOString()
                    }
                );

                return updatedMessages.sort((a, b) =>
                  new Date(a.timestamp||0).getTime()-new Date(b.timestamp||0).getTime()
                );
              });
            }
          }
        });
      } else {

        socket.emit('sendMessage', messageData, (response: any) => {
          if (response?.error) {

          } else {

          }
        });
      }
    } catch (err) {

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
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
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

          <div className="flex-1 overflow-y-auto">
            {showGroups? (
              <div className="divide-y divide-gray-100">
                {getVisibleGroups().map((group) => {
                  const isSelected=selectedTarget?.id===group.id&&selectedTarget?.type==='role';
                  const roleUsers = getUsersByRole(group.role as string, false);
                  const memberCount = roleUsers.length;
                  
                  return (
                    <div
                      key={group.id}
                      onClick={async () => {
                        const target={
                          id: group.id,
                          name: group.name,
                          type: 'role' as const,
                          role: group.role
                        };
                        setSelectedTarget(target);
                        await joinConversation(target);
                      }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 ${isSelected? 'bg-gray-100':''}`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FiUsers className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {getVisibleGroups().length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No hay grupos disponibles
                  </div>
                )}
              </div>
            ):(
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user: User) => (
                  user.id!==currentUser?.id&&(
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 relative"
                    >
                      <div className="relative">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-red-600" />
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${onlineUserIds.has(user.id)? 'bg-green-500':'bg-gray-400'
                            }`}
                          title={onlineUserIds.has(user.id)? 'En línea':'Desconectado'}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name||user.username}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {onlineUserIds.has(user.id)
                            ? 'En línea'
                            :user.lastSeen
                              ? `Visto ${new Date(user.lastSeen).toLocaleTimeString()}`
                              :'Desconectado'}
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
        {selectedTarget? (
          <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
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
                        const roleUsers=getUsersByRole(selectedTarget.role!, false);

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

            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto">
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
                        const username=isOwn? 'Tú':message.sender?.username||'Usuario';

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
                      <div ref={messagesEndRef} className="h-0" />
                    </div>
                  )}
                </div>
              )}
            </div>

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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ChatWindow;
