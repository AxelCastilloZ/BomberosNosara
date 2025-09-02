import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: (text: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, onTyping, disabled = false }: MessageInputProps) => {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTypingTime = useRef<number>(0);
  const TYPING_TIMEOUT = 2000; // 2 seconds

  // Notify parent about typing status
  useEffect(() => {
    if (!onTyping) return;
    
    const timer = setTimeout(() => {
      const timeSinceLastTyping = Date.now() - lastTypingTime.current;
      if (input && timeSinceLastTyping < TYPING_TIMEOUT) {
        onTyping(input); // Send current input text when typing
      } else if (!input) {
        onTyping(''); // Send empty string when not typing
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [input, onTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    lastTypingTime.current = Date.now();
    
    // Notify parent immediately about the current input
    if (onTyping) {
      onTyping(newValue);
    }
  };

  const handleSend = () => {
    const message = input.trim();
    if (!message || disabled) return;
    
    onSendMessage(message);
    setInput('');
    if (onTyping) onTyping(''); // Clear typing state when message is sent
    
    // Focus back on input after sending
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key, but not when composing IME text (like in Chinese/Japanese)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
        {/* Emoji and attachment buttons */}
        <div className="flex items-center pl-3 space-x-1">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50"
            disabled={disabled}
          >
            <FiSmile size={20} />
          </button>
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50"
            disabled={disabled}
          >
            <FiPaperclip size={20} />
          </button>
        </div>

        {/* Message input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          className={`flex-1 py-3 px-2 focus:outline-none bg-transparent ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
          placeholder={disabled ? 'Conectando...' : 'Escribe un mensaje...'}
          disabled={disabled}
          aria-label="Escribe un mensaje"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={`p-2 mr-1 rounded-full ${
            disabled || !input.trim()
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-red-600 hover:bg-red-50'
          } transition-colors focus:outline-none`}
          aria-label="Enviar mensaje"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
