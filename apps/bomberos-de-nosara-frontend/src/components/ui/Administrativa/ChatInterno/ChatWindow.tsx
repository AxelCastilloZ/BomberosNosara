import React from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  return (
    <div className="h-full flex flex-col border rounded shadow bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {  }
        <MessageBubble message="Hola, ¿hay alguna novedad?" from="user" />
        <MessageBubble message="No por ahora, todo tranquilo." from="admin" />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
