import { useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FaBell, FaCheck, FaComment } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UnreadMessage } from '../../../hooks/useChatNotifications';

interface NotificationsDropdownProps {
  unreadCount: number;
  unreadMessages: UnreadMessage[];
  isOpen: boolean;
  onToggle: () => void;
  onMarkAsRead: (messageId?: string) => void;
  onClose: () => void;
  navigateToChat: (conversationId: string, messageId?: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  unreadCount,
  unreadMessages,
  isOpen,
  onToggle,
  onMarkAsRead,
  onClose,
  navigateToChat,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = (e: React.MouseEvent, messageId?: string) => {
    e.stopPropagation();
    onMarkAsRead(messageId);
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: es 
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="relative p-2 text-gray-600 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors duration-200"
        aria-label={unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Notificaciones'}
        aria-expanded={isOpen}
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-red-100">
          <div className="p-3 border-b border-red-100 bg-red-50 flex justify-between items-center">
            <h3 className="font-medium text-red-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => handleMarkAsRead(e)}
                className="text-xs text-red-700 hover:text-red-900 font-medium"
              >
                Marcar todo como leído
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {unreadMessages.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {unreadMessages.map((message) => (
                  <li 
                    key={message.id} 
                    className="p-3 hover:bg-red-50 transition-colors duration-150 cursor-pointer border-b border-red-50 last:border-0"
                    onClick={(e) => {
                      e.preventDefault();
                      onMarkAsRead(message.id);
                      onClose();
                      navigateToChat(message.conversationId, message.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onMarkAsRead(message.id);
                        onClose();
                        navigateToChat(message.conversationId, message.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ir al chat con ${message.senderName}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                        <FaComment className="w-4 h-4" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-red-900">
                            {message.senderName}
                          </p>
                          <button
                            onClick={(e) => handleMarkAsRead(e, message.id)}
                            className="text-gray-400 hover:text-gray-500"
                            title="Marcar como leído"
                          >
                            <FaCheck className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {message.content}
                        </p>
                        <p className="mt-1 text-xs text-red-500">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay notificaciones nuevas
              </div>
            )}
          </div>

          {unreadMessages.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                type="button"
                className="w-full py-2 text-sm font-medium text-red-700 hover:text-red-900 focus:outline-none hover:bg-red-50 transition-colors duration-150"
                onClick={(e) => {
                  e.preventDefault();
                  onMarkAsRead();
                  onClose();
                  navigateToChat('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onMarkAsRead();
                    onClose();
                    navigateToChat('');
                  }
                }}
              >
                Ver todos los mensajes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
