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
  const [isNavbarOpen, setIsNavbarOpen]=useState(true);
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
  const [showEmojiPicker, setShowEmojiPicker]=useState(false);
  const typingTimeoutRef=useRef<Timeout|null>(null);
  const searchInputRef=useRef<HTMLInputElement>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);
  const messagesContainerRef=useRef<HTMLDivElement>(null);
  const emojiPickerRef=useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTarget]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside=(event: MouseEvent) => {
      if (emojiPickerRef.current&&!emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Emoji categories and data
  const emojiCategories={
    'Frecuentes': ['😀', '😂', '🥰', '😍', '🤔', '😊', '👍', '❤️', '🔥', '💯', '🎉', '👏'],
    'Emociones': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
    'Gestos': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    'Objetos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '💯', '💢', '💥', '💫', '💦', '💨'],
    'Símbolos': ['✅', '❌', '⭐', '🌟', '💫', '🔥', '💯', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚡', '💎', '🔔', '🔕', '📢', '📣', '💬', '💭', '🗯️', '💤']
  };

  const handleEmojiSelect=(emoji: string) => {
    setInputValue(prev => prev+emoji);
    setShowEmojiPicker(false);
  };

  const getUsersByRole=useCallback((roleName: string, excludeCurrentUser=true): User[] => {
    if (!users) return [];

    return users.filter(user => {

      if (excludeCurrentUser&&user.id===currentUser?.id) return false;

      // SUPERUSER is automatically a member of all groups
      const isSuperUser=user.roles?.some(role =>
        typeof role==='string'? role===RoleEnum.SUPERUSER:role.name===RoleEnum.SUPERUSER
      );

      if (isSuperUser) return true;

      return user.roles?.some(role =>
        typeof role==='string'? role===roleName:role.name===roleName
      );
    });
  }, [users, currentUser?.id]);

  // Check if current user has a specific role
  const currentUserHasRole=useCallback((roleName: string): boolean => {
    if (!currentUser?.roles) return false;
    return currentUser.roles.some(role =>
      typeof role==='string'? role===roleName:role.name===roleName
    );
  }, [currentUser?.roles]);

  // Check if current user is SUPERUSER
  const isSuperUser=useCallback((): boolean => {
    return currentUserHasRole(RoleEnum.SUPERUSER);
  }, [currentUserHasRole]);

  // Filter visible groups based on requirements
  const getVisibleGroups=useCallback((): ChatTarget[] => {
    return roleGroups.filter(group => {
      // Get users with this role (including current user for count)
      const roleUsers=getUsersByRole(group.role as string, false);

      // Group must have at least 2 members to be visible
      if (roleUsers.length<2) {
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
          const userData=await fetchCurrentUser();
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
      const superUsers=users.filter(user =>
        user.roles?.some(userRole =>
          typeof userRole==='string'? userRole===RoleEnum.SUPERUSER:userRole.name===RoleEnum.SUPERUSER
        )&&!participantIds.includes(user.id)
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
      <div className="flex items-center justify-center h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh]">
        <FiLoader className="animate-spin text-red-500 text-2xl" />
      </div>
    );
  }


  return (
    <div className="bg-gray-50 h-full w-full min-w-full">
      <div className="flex flex-col md:flex-row h-full overflow-hidden w-full">

        <div
          className={`bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ease-in-out ${isNavbarOpen? 'w-80':'w-20'} flex-shrink-0 h-full overflow-y-auto`}
        >
          <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="relative group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar conversaciones..."
                className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-gray-300"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-red-500" />
              {searchQuery&&(
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced tab navigation */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-4 font-medium text-sm transition-all duration-200 relative ${showGroups
                ? 'text-red-600 bg-white shadow-sm'
                :'text-gray-500 hover:bg-white hover:text-gray-700'
                }`}
              onClick={() => setShowGroups(true)}
            >
              <div className="flex items-center justify-center space-x-2">
                <FiUsers className="w-4 h-4" />
                <span>Grupos</span>
              </div>
              {showGroups&&(
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full"></div>
              )}
            </button>
            <button
              className={`flex-1 py-4 px-4 font-medium text-sm transition-all duration-200 relative ${!showGroups
                ? 'text-red-600 bg-white shadow-sm'
                :'text-gray-500 hover:bg-white hover:text-gray-700'
                }`}
              onClick={() => setShowGroups(false)}
            >
              <div className="flex items-center justify-center space-x-2">
                <FiUser className="w-4 h-4" />
                <span>Usuarios</span>
              </div>
              {!showGroups&&(
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full"></div>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showGroups? (
              <div className="p-2 space-y-1">
                {getVisibleGroups().map((group) => {
                  const isSelected=selectedTarget?.id===group.id&&selectedTarget?.type==='role';
                  const roleUsers=getUsersByRole(group.role as string, false);
                  const memberCount=roleUsers.length;
                  const onlineCount=roleUsers.filter(user => onlineUserIds.has(user.id)).length;

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
                      className={`p-4 rounded-xl cursor-pointer flex items-center space-x-4 transition-all duration-200 group ${isSelected
                        ? 'bg-red-50 border-2 border-red-200 shadow-md'
                        :'bg-white hover:bg-gray-50 hover:shadow-md border-2 border-transparent hover:border-gray-200'
                        }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${isSelected
                          ? 'bg-gradient-to-br from-red-100 to-red-200'
                          :'bg-gradient-to-br from-red-100 to-red-150 group-hover:shadow-md'
                          }`}>
                          <FiUsers className="w-6 h-6 text-red-600" />
                        </div>
                        {onlineCount>0&&(
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                            {onlineCount}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">{group.name}</p>
                          {isSelected&&(
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {memberCount} {memberCount===1? 'miembro':'miembros'}
                          </p>
                          {onlineCount>0&&(
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-xs text-green-600 font-medium">
                                {onlineCount} en línea
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getVisibleGroups().length===0&&(
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiUsers className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No hay grupos disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">Los grupos aparecerán aquí cuando estén disponibles</p>
                  </div>
                )}
              </div>
            ):(
              <div className="p-2 space-y-1">
                {filteredUsers.map((user: User) => (
                  user.id!==currentUser?.id&&(
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`p-4 rounded-xl cursor-pointer flex items-center space-x-4 transition-all duration-200 group ${selectedTarget?.id===user.id&&selectedTarget?.type==='user'
                        ? 'bg-red-50 border-2 border-red-200 shadow-md'
                        :'bg-white hover:bg-gray-50 hover:shadow-md border-2 border-transparent hover:border-gray-200'
                        }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${selectedTarget?.id===user.id&&selectedTarget?.type==='user'
                          ? 'bg-gradient-to-br from-red-100 to-red-200'
                          :'bg-gradient-to-br from-red-100 to-red-150 group-hover:shadow-md'
                          }`}>
                          <FiUser className="w-6 h-6 text-red-600" />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-md transition-all duration-300 ${onlineUserIds.has(user.id)? 'bg-green-500':'bg-gray-400'
                            }`}
                          title={onlineUserIds.has(user.id)? 'En línea':'Desconectado'}
                        >
                          {onlineUserIds.has(user.id)&&(
                            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60"></div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name||user.username}
                          </p>
                          {selectedTarget?.id===user.id&&selectedTarget?.type==='user'&&(
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${onlineUserIds.has(user.id)? 'bg-green-500':'bg-gray-400'
                            }`}></div>
                          <p className={`text-xs font-medium ${onlineUserIds.has(user.id)? 'text-green-600':'text-gray-500'
                            }`}>
                            {onlineUserIds.has(user.id)
                              ? 'En línea'
                              :user.lastSeen
                                ? `Visto ${new Date(user.lastSeen).toLocaleTimeString()}`
                                :'Desconectado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                {filteredUsers.length===0&&(
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
                    <p className="text-xs text-gray-400 mt-1">Intenta ajustar tu búsqueda</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {selectedTarget? (
          <div className="flex-1 flex flex-col bg-white border-l border-gray-200 w-full max-w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar with enhanced styling */}
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${selectedTarget.type==='role'
                      ? 'bg-gradient-to-br from-red-100 to-red-200 hover:shadow-lg'
                      :'bg-gradient-to-br from-red-100 to-red-200 hover:shadow-lg'
                      }`}>
                      {selectedTarget.type==='role'? (
                        <FiUsers className="w-6 h-6 text-red-600" />
                      ):(
                        <FiUser className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    {/* Enhanced online status indicator for 1:1 chats */}
                    {selectedTarget.type==='user'&&(
                      <div className="absolute -bottom-1 -right-1">
                        <div
                          className={`w-4 h-4 rounded-full border-3 border-white shadow-lg transition-all duration-300 ${onlineUserIds.has(selectedTarget.id as number)
                            ? 'bg-green-500 shadow-green-300'
                            :'bg-gray-400 shadow-gray-300'
                            }`}
                          title={onlineUserIds.has(selectedTarget.id as number)? 'En línea':'Desconectado'}
                        >
                          {/* Enhanced pulse animation for online status */}
                          {onlineUserIds.has(selectedTarget.id as number)&&(
                            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat info section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {selectedTarget.name}
                      </h2>

                      {/* Role member count badge */}
                      {selectedTarget.type==='role'&&(
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          {(() => {
                            const roleUsers=getUsersByRole(selectedTarget.role!, false);
                            return `${roleUsers.length} ${roleUsers.length===1? 'miembro':'miembros'}`;
                          })()}
                        </span>
                      )}

                      {/* Online status badge for 1:1 chats */}
                      {selectedTarget.type==='user'&&(
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${onlineUserIds.has(selectedTarget.id as number)
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          :'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${onlineUserIds.has(selectedTarget.id as number)? 'bg-green-500':'bg-gray-400'
                            }`}></div>
                          {onlineUserIds.has(selectedTarget.id as number)? 'En línea':'Desconectado'}
                        </span>
                      )}
                    </div>

                    {/* Status text */}
                    {typingUsers.size>0? (
                      <div className="flex items-center mt-1">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <p className="text-sm text-gray-500 ml-2 font-medium">Escribiendo...</p>
                      </div>
                    ):selectedTarget.type==='role'? (
                      <div className="mt-1">
                        <div className="text-xs text-gray-600">
                          {(() => {
                            const roleUsers=getUsersByRole(selectedTarget.role!, false);

                            if (roleUsers.length===0) {
                              return 'No hay otros usuarios disponibles en este grupo';
                            }

                            return roleUsers.map((user, index) => (
                              <span key={user.id}>
                                {getUserDisplayName(user)}
                                {index<roleUsers.length-1? ', ':''}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    ):null}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-3">
                  {/* Call button for 1:1 chats */}
                  {selectedTarget.type==='user'&&(
                    <button
                      className="p-2.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      aria-label="Llamar"
                      title="Iniciar llamada"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  )}

                  {/* Video call button for 1:1 chats */}
                  {selectedTarget.type==='user'&&(
                    <button
                      className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      aria-label="Videollamada"
                      title="Iniciar videollamada"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}

                  {/* More options button */}
                  <button
                    className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200"
                    aria-label="Más opciones"
                    title="Más opciones"
                  >
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white w-full h-full min-w-0">
              {isLoading? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-red-600 border-t-transparent"></div>
                    <p className="text-sm text-gray-500 font-medium">Cargando mensajes...</p>
                  </div>
                </div>
              ):(
                <div className="h-full flex flex-col">
                  {messages.length===0? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-sm">
                        <FiMessageSquare className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">💬 No hay mensajes aún</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        {selectedTarget?.type==='role'
                          ? '🚀 Sé el primero en enviar un mensaje al grupo'
                          :'👋 Inicia la conversación enviando un mensaje'
                        }
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span>⚡</span>
                          <span>Mensajes en tiempo real</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>💾</span>
                          <span>Historial guardado</span>
                        </div>
                      </div>
                    </div>
                  ):(
                    <div className="space-y-4 pb-4">
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

            <form onSubmit={handleSendMessage} className="p-6 bg-gradient-to-r from-white to-gray-50 border-t border-gray-100">
              <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="p-4">
                  <input
                    type="text"
                    placeholder={`Escribe un mensaje ${selectedTarget?.type==='role'? 'al grupo':'a '+selectedTarget?.name}...`}
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500 text-base resize-none"
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
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center space-x-3">
                    {/* Emoji button with picker */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-full transition-all duration-200 ${showEmojiPicker
                          ? 'bg-red-100 text-red-600'
                          :'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                          }`}
                        title="Emojis"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {/* Emoji Picker */}
                      {showEmojiPicker&&(
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-50">
                          <div className="space-y-4">
                            {Object.entries(emojiCategories).map(([category, emojis]) => (
                              <div key={category}>
                                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                  {category}
                                </h4>
                                <div className="grid grid-cols-8 gap-1">
                                  {emojis.map((emoji, index) => (
                                    <button
                                      key={`${category}-${index}`}
                                      type="button"
                                      onClick={() => handleEmojiSelect(emoji)}
                                      className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-all duration-200 hover:scale-110"
                                      title={emoji}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Picker footer */}
                          <div className="p-4 border-t border-gray-100 bg-white w-full text-center">
                            <p className="text-xs text-gray-500">
                              Haz clic en un emoji para agregarlo 😊
                            </p>
                          </div>
                        </div>
                      )}
                    </div>


                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Character counter for long messages */}
                    {inputValue.length>100&&(
                      <span className={`text-xs font-medium ${inputValue.length>500? 'text-red-500':'text-gray-400'
                        }`}>
                        {inputValue.length}/1000
                      </span>
                    )}

                    {/* Send button */}
                    <button
                      type="submit"
                      className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 flex items-center space-x-2 ${inputValue.trim()
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                        :'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      disabled={!inputValue.trim()}
                    >
                      <span>Enviar</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Typing indicator hint */}
              <div className="mt-2 text-xs text-gray-400 text-center">
                Presiona Enter para enviar • Shift + Enter para nueva línea
              </div>
            </form>
          </div>
        ):(
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-white h-full w-full">
            <div className="text-center p-12 max-w-lg">
              {/* Enhanced icon with gradient background */}
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-lg">
                <FiMessageSquare className="w-12 h-12 text-red-600" />
              </div>

              {/* Improved typography */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                💬 Sistema de Chat Interno
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                🔒 Comunícate con tu equipo de forma segura y eficiente
              </p>

              {/* Simplified feature highlights */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Chat Directo</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-lg">👥</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Grupos</p>
                </div>
              </div>

              {/* Call to action */}
              <div className="mt-8 text-sm text-gray-500">
                👆 Selecciona un contacto para comenzar
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ChatWindow;