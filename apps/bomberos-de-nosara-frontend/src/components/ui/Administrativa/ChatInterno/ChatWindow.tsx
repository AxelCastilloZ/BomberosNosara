import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../../../contexts/SocketContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiMessageSquare, FiLoader } from 'react-icons/fi';

declare global {
  interface Window {
    // Add any global browser APIs you need to access
  }
}

interface Message {
  id: string;
  content: string;
  from: 'user'|'admin';
  timestamp: string;
  username?: string;
  avatar?: string;
}

const ChatWindow=() => {
  const { socket, isConnected }=useSocket();
  const [messages, setMessages]=useState<Message[]>([]);
  const [typingUsers, setTypingUsers]=useState<Set<string>>(new Set());
  const typingTimeoutRef=useRef<ReturnType<typeof setTimeout>>(null);
  const messagesEndRef=useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing indicator
  const handleTyping=useCallback((text: string) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text) {
      typingTimeoutRef.current=setTimeout(() => {
        handleTyping('');
      }, 2000);
    }
  }, []);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage=(message: Omit<Message, 'id'>) => {
      setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
    };

    const handleUserTyping=(username: string) => {
      setTypingUsers(prev => new Set(prev).add(username));

      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet=new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      }, 2000);
    };

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('receiveMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);

    // Clean up event listeners
    return () => {
      socket.off('receiveMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket]);

  const handleSendMessage=useCallback((content: string) => {
    if (!socket||!content.trim()) return;

    const newMessage={
      content,
      from: 'user' as const,
      timestamp: new Date().toISOString(),
      username: 'Tú',
      avatar: 'https://ui-avatars.com/api/?name=Usuario&background=random'
    };

    // Notify other users that we've stopped typing
    socket.emit('typing', false);
    handleTyping('');

    // Emit the message to the server
    socket.emit('sendMessage', newMessage);

    // Add the message to the local state immediately for instant feedback
    setMessages(prev => [...prev, { ...newMessage, id: Date.now().toString() }]);
  }, [socket, handleTyping]);

  const handleInputChange=(text: string) => {
    if (!socket||!isConnected) return;

    const currentlyTyping=text.length>0;
    if (currentlyTyping) {
      socket.emit('typing', 'Usuario está escribiendo...');
    } else {
      socket.emit('typing', '');
    }

    // Update local typing state for the current user's UI
    handleTyping(text);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center">
            <FiMessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Chat en Vivo</h2>
            <div className="text-sm opacity-80">
              {isConnected? 'En línea':'Conectando...'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected? 'bg-green-400':'bg-gray-400'}`}></div>
          <span className="text-sm">{isConnected? 'En línea':'Desconectado'}</span>
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
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageBubble
                  message={message.content}
                  from={message.from}
                  timestamp={message.timestamp}
                  username={message.username}
                  avatar={message.avatar}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {typingUsers.size>0&&(
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm w-fit"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-600">
              {Array.from(typingUsers).join(', ')} está escribiendo...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleInputChange}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
