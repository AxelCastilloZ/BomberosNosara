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
} from 'react-icons/fi';
import { RoleEnum, RoleLabels } from '../../../../types/role.enum';
import { Timeout, User, ChatTarget, Message, Conversation } from './types';

const roleGroups: ChatTarget[] = [
  { id: RoleEnum.SUPERUSER,         name: 'Superusuarios',     type: 'role', role: RoleEnum.SUPERUSER },
  { id: RoleEnum.ADMIN,             name: 'Administradores',   type: 'role', role: RoleEnum.ADMIN },
  { id: RoleEnum.PERSONAL_BOMBERIL, name: 'Personal Bomberil', type: 'role', role: RoleEnum.PERSONAL_BOMBERIL },
  { id: RoleEnum.VOLUNTARIO,        name: 'Voluntarios',       type: 'role', role: RoleEnum.VOLUNTARIO },
];

const ChatWindow = () => {
  const { socket, isConnected } = useSocket();
  const { token } = useAuth();
  const {
    fetchCurrentUser,
    fetchAvailableUsers,
    getOrCreateGroupConversation,
    getConversationMessages,
    findConversationWithUser,
  } = useChatApi();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<ChatTarget | null>(null);
  const [showGroups, setShowGroups] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingTimeoutRef = useRef<Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedTarget]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const emojiCategories = {
    Frecuentes: ['😀','😂','🥰','😍','🤔','😊','👍','❤️','🔥','💯','🎉','👏'],
    Emociones: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳'],
    Gestos: ['👍','👎','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👋','🤚','🖐️','✋','🖖','👏','🙌','🤲','🤝','🙏'],
    Objetos: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','🔥','💯','💢','💥','💫','💦','💨'],
    Símbolos: ['✅','❌','⭐','🌟','💫','🔥','💯','🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','⚡','💎','🔔','🔕','📢','📣','💬','💭','🗯️','💤'],
  };
  const handleEmojiSelect = (emoji: string) => {
    setInputValue((p) => p + emoji);
    setShowEmojiPicker(false);
  };

  const getUsersByRole = useCallback((roleName: string, excludeCurrent = true): User[] => {
    return users.filter((u) => {
      if (excludeCurrent && u.id === currentUser?.id) return false;
      const isSU = u.roles?.some((r) => (typeof r === 'string' ? r === RoleEnum.SUPERUSER : r.name === RoleEnum.SUPERUSER));
      if (isSU) return true;
      return u.roles?.some((r) => (typeof r === 'string' ? r === roleName : r.name === roleName));
    });
  }, [users, currentUser?.id]);

  const currentUserHasRole = useCallback((roleName: string) => {
    if (!currentUser?.roles) return false;
    return currentUser.roles.some((r) => (typeof r === 'string' ? r === roleName : r.name === roleName));
  }, [currentUser?.roles]);

  const isSuperUser = useCallback(() => currentUserHasRole(RoleEnum.SUPERUSER), [currentUserHasRole]);

  const getVisibleGroups = useCallback((): ChatTarget[] => {
    return roleGroups.filter((g) => {
      const roleUsers = getUsersByRole(g.role as string, false);
      if (roleUsers.length < 2) return false;
      if (isSuperUser()) return true;
      return currentUserHasRole(g.role as string);
    });
  }, [getUsersByRole, isSuperUser, currentUserHasRole]);

  const getUserDisplayName = (u: User): string =>
    (u.id === currentUser?.id ? 'Tú' : (u.name || u.username || 'Usuario'));

  /* ====== Carga de "me" y usuarios ====== */
  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      setUsers([]);
      setFilteredUsers([]);
      return;
    }
    (async () => {
      const [me, available] = await Promise.all([
        fetchCurrentUser(),
        fetchAvailableUsers(),
      ]);
      if (me) setCurrentUser(me);
      setUsers(available);
      setFilteredUsers(available);
    })();
  }, [token, fetchCurrentUser, fetchAvailableUsers]);
  /* ===================================== */

  const handleGetOrCreateGroupConversation = useCallback(async (role: RoleEnum, groupName: string) => {
    const roleUsers = getUsersByRole(role, false);
    const participantIds = roleUsers.map((u) => u.id);
    const superUsers = users.filter(
      (u) => u.roles?.some((r) => (typeof r === 'string' ? r === RoleEnum.SUPERUSER : r.name === RoleEnum.SUPERUSER)) && !participantIds.includes(u.id)
    );
    participantIds.push(...superUsers.map((u) => u.id));
    if (!participantIds.length) return null;
    return await getOrCreateGroupConversation(participantIds, groupName);
  }, [getUsersByRole, getOrCreateGroupConversation, users]);

  const joinConversation = useCallback(async (target: ChatTarget) => {
    if (!socket || !target) return;
    if (selectedTarget?.id === target.id && selectedTarget?.type === target.type) return;

    setIsLoading(true);
    setMessages([]);

    try {
      const isGroup = target.type === 'role';
      let convId: number | null = null;

      if (isGroup && target.role) {
        const groupConvId = await handleGetOrCreateGroupConversation(target.role, RoleLabels[target.role]);
        if (groupConvId) {
          convId = Number(groupConvId);
          setConversationId(convId);
        }
      }

      if (!convId) {
        setIsLoading(false);
        return;
      }

      const joinPromise = new Promise<void>((resolve) => {
        socket.emit('joinConversation', { conversationId: convId, isGroup }, () => resolve());
      });

      const [messagesData] = await Promise.all([
        getConversationMessages(convId),
        joinPromise,
      ]);

      const processed = messagesData
        .map((msg: any) => ({
          ...msg,
          isOwn: msg.senderId === currentUser?.id || (msg.sender && msg.sender.id === currentUser?.id),
          isGroup,
          groupId: isGroup ? convId! : undefined,
          sender: { id: msg.senderId || (msg.sender?.id || 0), username: msg.sender?.username || 'Usuario' },
          timestamp: msg.timestamp || new Date().toISOString(),
        }))
        .sort((a: Message, b: Message) =>
          new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );

      setMessages(processed);
      setSelectedTarget(target);
    } finally {
      setIsLoading(false);
    }
  }, [socket, currentUser?.id, selectedTarget, handleGetOrCreateGroupConversation, getConversationMessages]);

  // Al cambiar de target, salir de la sala anterior
  useEffect(() => {
    if (!selectedTarget) return;
    const currentTarget = selectedTarget;
    const currentConvId = conversationId;

    joinConversation(currentTarget);

    return () => {
      if (socket && currentTarget && currentTarget.type === 'role' && currentConvId) {
        socket.emit('leaveConversation', { conversationId: currentConvId, isGroup: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget, joinConversation, socket]);

  useEffect(() => {
    if (!searchQuery.trim()) setFilteredUsers(users);
    else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, users]);

  const handleSelectUser = useCallback(async (user: User) => {
    if (!token || !currentUser) return;
    setIsLoading(true);
    try {
      setSelectedTarget({ id: user.id, name: user.name || user.username || 'Usuario', type: 'user' });
      setSearchQuery('');
      const conv = await findConversationWithUser(user.id);
      if (conv) {
        setConversation(conv);
        const msgs = await getConversationMessages(conv.id);
        setMessages(msgs || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser, findConversationWithUser, getConversationMessages]);

  const updateUserOnlineStatus = (userId: number, on: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, online: on, lastSeen: on ? new Date().toISOString() : u.lastSeen } : u)));
    setFilteredUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, online: on, lastSeen: on ? new Date().toISOString() : u.lastSeen } : u)));
    setOnlineUserIds((prev) => {
      const s = new Set(prev);
      on ? s.add(userId) : s.delete(userId);
      return s;
    });
  };

  const handleUserOnline = useCallback((d: { userId: number; status: 'online' | 'offline' }) => {
    updateUserOnlineStatus(d.userId, d.status === 'online');
  }, []);

  const handleOnlineUsers = useCallback((ids: number[]) => {
    setOnlineUserIds(new Set(ids));
    setUsers((prev) => prev.map((u) => ({ ...u, online: ids.includes(u.id) })));
    setFilteredUsers((prev) => prev.map((u) => ({ ...u, online: ids.includes(u.id) })));
  }, []);

  const handleNewMessage = useCallback((message: Message) => {
    if (!selectedTarget) return;

    const matches =
      (selectedTarget.type === 'role' && message.isGroup &&
        (message.groupId === selectedTarget.role || message.groupId === selectedTarget.id || message.conversationId === conversationId)) ||
      (selectedTarget.type === 'user' && !message.isGroup &&
        (message.senderId === selectedTarget.id || message.to === selectedTarget.id));

    if (!matches) return;

    setMessages((prev) => {
      const exists = prev.some(
        (m) =>
          m.id === message.id ||
          (m.content === message.content &&
            m.senderId === message.senderId &&
            Math.abs(new Date(m.timestamp || '').getTime() - new Date(message.timestamp || '').getTime()) < 1000)
      );
      if (exists) return prev;
      const next = [
        ...prev,
        {
          ...message,
          isOwn:
            message.isOwn !== undefined
              ? message.isOwn
              : message.senderId === currentUser?.id || (message.sender && message.sender.id === currentUser?.id),
          timestamp: message.timestamp || new Date().toISOString(),
        },
      ];
      return next.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
    });
  }, [selectedTarget, conversationId, currentUser?.id]);

  const handleUserTyping = useCallback((d: {
    userId: number | string; username: string; isTyping: boolean; isGroup?: boolean; groupId?: string | number; role?: string;
  }) => {
    if (d.userId === currentUser?.id) return;
    const forThis =
      (selectedTarget?.type === 'role' && d.isGroup && d.role === selectedTarget.role) ||
      (selectedTarget?.type === 'user' && d.userId === selectedTarget.id && !d.isGroup);
    if (!forThis) return;

    setTypingUsers((prev) => {
      const s = new Set(prev);
      d.isTyping ? s.add(d.username) : s.delete(d.username);
      return s;
    });
  }, [currentUser?.id, selectedTarget]);

  useEffect(() => {
    if (!socket || !isConnected || !currentUser) return;
    socket.on('userStatus', handleUserOnline);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleUserTyping);
    socket.on('stopTyping', (d: { username: string }) => {
      setTypingUsers((prev) => {
        const s = new Set(prev); s.delete(d.username); return s;
      });
    });

    socket.emit('getOnlineUsers');

    return () => {
      socket.off('userStatus', handleUserOnline);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleUserTyping);
      socket.off('stopTyping');
    };
  }, [socket, isConnected, currentUser, handleUserOnline, handleOnlineUsers, handleNewMessage, handleUserTyping]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (value.trim() && selectedTarget && currentUser) {
      const data = {
        to: selectedTarget.id,
        isTyping: true,
        isGroup: selectedTarget.type === 'role',
        userId: currentUser.id,
        username: currentUser.username || 'Usuario',
        role: selectedTarget.type === 'role' ? selectedTarget.role : undefined,
      };
      socket?.emit('typing', data);

      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit('typing', { ...data, isTyping: false });
        typingTimeoutRef.current = null;
      }, 1000);
    }
  }, [selectedTarget, currentUser, socket]);

  const handleBackToList = useCallback(() => {
    setSelectedTarget(null);
    setConversation(null);
    setMessages([]);
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredUsers(users);
    searchInputRef.current?.focus();
  }, [users]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedTarget || !socket || !currentUser) return;

    const isGroup = selectedTarget.type === 'role';
    const senderId = currentUser.id;

    const text = inputValue; // guarda antes de limpiar
    setInputValue('');

    try {
      if (isGroup) {
        if (!conversationId) return;
        const payload = {
          role: selectedTarget.role!,
          message: text,
          senderId,
          groupName: RoleLabels[selectedTarget.role!],
        };

        const optimistic: Message = {
          id: Date.now(),
          content: text,
          senderId,
          timestamp: new Date().toISOString(),
          isOwn: true,
          isGroup: true,
          groupId: conversationId,
          sender: { id: senderId, username: 'Tú' },
        };

        setMessages((prev) =>
          [...prev, optimistic].sort((a, b) =>
            new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
          )
        );

        socket.emit('sendToRole', payload, (res: any) => {
          if (res?.error) {
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          } else if (res.message) {
            setMessages((prev) =>
              prev
                .map((m) =>
                  m.id === optimistic.id
                    ? { ...res.message, isOwn: true, timestamp: res.message.timestamp || new Date().toISOString() }
                    : m
                )
                .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
            );
          }
        });
      } else {
        socket.emit('sendMessage', { to: selectedTarget.id, message: text, senderId, isGroup: false }, () => {});
      }
    } catch {
      /* swallow */
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
          {selectedTarget && (
            <button onClick={handleBackToList} className="mr-4 p-1 rounded-full hover:bg-red-700 transition-colors" aria-label="Volver a la lista">
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold">Chat Interno</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-red-700 transition-colors" aria-label="Buscar" onClick={() => searchInputRef.current?.focus()}>
            <FiSearch className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-red-700 transition-colors" aria-label="Más opciones">
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Buscador */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="relative group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar conversaciones..."
                className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-4 font-medium text-sm ${showGroups ? 'text-red-600 bg-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-700'}`}
              onClick={() => setShowGroups(true)}
            >
              <div className="flex items-center justify-center space-x-2">
                <FiUsers className="w-4 h-4" />
                <span>Grupos</span>
              </div>
              {showGroups && <div className="h-0.5 bg-red-600 rounded-t-full" />}
            </button>
            <button
              className={`flex-1 py-4 px-4 font-medium text-sm ${!showGroups ? 'text-red-600 bg-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-700'}`}
              onClick={() => setShowGroups(false)}
            >
              <div className="flex items-center justify-center space-x-2">
                <FiUser className="w-4 h-4" />
                <span>Usuarios</span>
              </div>
              {!showGroups && <div className="h-0.5 bg-red-600 rounded-t-full" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showGroups ? (
              <div className="p-2 space-y-1">
                {getVisibleGroups().map((group) => {
                  const isSelected = selectedTarget?.id === group.id && selectedTarget?.type === 'role';
                  const roleUsers = getUsersByRole(group.role as string, false);
                  const memberCount = roleUsers.length;
                  const onlineCount = roleUsers.filter((u) => onlineUserIds.has(u.id)).length;

                  return (
                    <div
                      key={group.id}
                      onClick={async () => {
                        const target = { id: group.id, name: group.name, type: 'role' as const, role: group.role };
                        setSelectedTarget(target);
                        await joinConversation(target);
                      }}
                      className={`p-4 rounded-xl cursor-pointer flex items-center space-x-4 ${isSelected ? 'bg-red-50 border-2 border-red-200 shadow-md' : 'bg-white hover:bg-gray-50 hover:shadow-md border-2 border-transparent hover:border-gray-200'}`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isSelected ? 'bg-gradient-to-br from-red-100 to-red-200' : 'bg-gradient-to-br from-red-100 to-red-150'}`}>
                          <FiUsers className="w-6 h-6 text-red-600" />
                        </div>
                        {onlineCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                            {onlineCount}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">{group.name}</p>
                          {isSelected && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">{memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}</p>
                          {onlineCount > 0 && (<><span className="text-gray-300">•</span><p className="text-xs text-green-600 font-medium">{onlineCount} en línea</p></>)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getVisibleGroups().length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiUsers className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No hay grupos disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">Los grupos aparecerán aquí cuando estén disponibles</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredUsers.map((u) => u.id !== currentUser?.id && (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-4 rounded-xl cursor-pointer flex items-center space-x-4 ${selectedTarget?.id === u.id && selectedTarget?.type === 'user' ? 'bg-red-50 border-2 border-red-200 shadow-md' : 'bg-white hover:bg-gray-50 hover:shadow-md border-2 border-transparent hover:border-gray-200'}`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${selectedTarget?.id === u.id && selectedTarget?.type === 'user' ? 'bg-gradient-to-br from-red-100 to-red-200' : 'bg-gradient-to-br from-red-100 to-red-150'}`}>
                        <FiUser className="w-6 h-6 text-red-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-md ${onlineUserIds.has(u.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name || u.username}</p>
                        {selectedTarget?.id === u.id && selectedTarget?.type === 'user' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${onlineUserIds.has(u.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <p className={`text-xs font-medium ${onlineUserIds.has(u.id) ? 'text-green-600' : 'text-gray-500'}`}>
                          {onlineUserIds.has(u.id) ? 'En línea' : (u.lastSeen ? `Visto ${new Date(u.lastSeen).toLocaleTimeString()}` : 'Desconectado')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
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

        {selectedTarget ? (
          <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
            {/* Header del chat seleccionado (solo UI) */}

            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-sm">
                    <FiMessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">💬 No hay mensajes aún</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    {selectedTarget.type === 'role' ? '🚀 Sé el primero en enviar un mensaje al grupo' : '👋 Inicia la conversación enviando un mensaje'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {messages.map((m, i) => {
                    const isOwn = m.sender?.id === currentUser?.id;
                    const username = isOwn ? 'Tú' : m.sender?.username || 'Usuario';
                    return (
                      <MessageBubble
                        key={m.id || i}
                        message={m.content}
                        isOwn={isOwn}
                        timestamp={m.timestamp || new Date().toISOString()}
                        username={username}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} className="h-0" />
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-gradient-to-r from-white to-gray-50 border-t border-gray-100">
              <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="p-4">
                  <input
                    type="text"
                    placeholder={`Escribe un mensaje ${selectedTarget.type === 'role' ? 'al grupo' : 'a ' + selectedTarget.name}...`}
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500 text-base"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as unknown as FormEvent);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div className="relative" ref={emojiPickerRef}>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((s) => !s)}
                      className={`p-2 rounded-full ${showEmojiPicker ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                      title="Emojis"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-50">
                        <div className="space-y-4">
                          {Object.entries(emojiCategories).map(([cat, emojis]) => (
                            <div key={cat}>
                              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{cat}</h4>
                              <div className="grid grid-cols-8 gap-1">
                                {emojis.map((e, idx) => (
                                  <button
                                    key={`${cat}-${idx}`}
                                    type="button"
                                    onClick={() => handleEmojiSelect(e)}
                                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-all duration-200 hover:scale-110"
                                  >
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                          <p className="text-xs text-gray-500">Haz clic en un emoji para agregarlo 😊</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-full font-semibold ${inputValue.trim() ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={!inputValue.trim()}
                  >
                    Enviar
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">Presiona Enter para enviar • Shift + Enter para nueva línea</div>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center p-12 max-w-lg">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-lg">
                <FiMessageSquare className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">💬 Sistema de Chat Interno</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">🔒 Comunícate con tu equipo de forma segura y eficiente</p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center"><span className="text-lg">👤</span></div>
                  <p className="text-xs font-medium text-gray-700">Chat Directo</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center"><span className="text-lg">👥</span></div>
                  <p className="text-xs font-medium text-gray-700">Grupos</p>
                </div>
              </div>
              <div className="mt-8 text-sm text-gray-500">👆 Selecciona un contacto para comenzar</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
