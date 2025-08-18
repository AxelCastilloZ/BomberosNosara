import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageBubbleProps {
  message: string;
  isOwn: boolean;
  timestamp: string;
  username: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  timestamp,
  username,
}) => {
  const formattedTime = timestamp 
    ? format(new Date(timestamp), 'HH:mm', { locale: es })
    : '';

  return (
    <div className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center mb-1">
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="text-blue-500 text-sm font-medium">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div 
          className={`px-4 py-2 rounded-lg max-w-xs ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          {!isOwn && (
            <p className="text-xs font-medium text-gray-600 mb-1">{username}</p>
          )}
          <p className={isOwn ? 'text-white' : 'text-gray-800'}>{message}</p>
          <p className={`text-xs mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {formattedTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
  