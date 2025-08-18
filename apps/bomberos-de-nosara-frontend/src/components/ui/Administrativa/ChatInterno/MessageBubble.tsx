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
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-2`}>
      <div className="flex items-start gap-2 w-full">
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-sm font-medium">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col max-w-[80%]">
          {!isOwn && (
            <span className="text-xs font-medium text-gray-600 mb-1">
              {username}
            </span>
          )}
          <div 
            className={`px-4 py-3 rounded-2xl ${isOwn 
              ? 'bg-blue-500 text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}
          >
            <p className="text-sm">{message}</p>
          </div>
          <span className={`text-[10px] mt-1 ${isOwn ? 'text-gray-400 text-right' : 'text-gray-400'}`}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
  