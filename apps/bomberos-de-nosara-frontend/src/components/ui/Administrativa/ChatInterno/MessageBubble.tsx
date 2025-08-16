import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  message: string;
  from: 'user' | 'admin';
  timestamp?: string;
  username?: string;
  avatar?: string;
}
  
const MessageBubble = ({ message, from, timestamp }: Props) => {
  const isUser = from === 'user';
  const formattedTime = timestamp 
    ? format(new Date(timestamp), 'HH:mm', { locale: es })
    : '';

  return (
    <div className={`my-2 flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
      <div 
        className={`px-4 py-2 rounded-lg max-w-xs ${isUser ? 'bg-gray-100' : 'bg-red-100'} shadow-sm`}
      >
        <p className="text-gray-800">{message}</p>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-gray-500' : 'text-red-600'}`}>
            {formattedTime}
          </p>
        )}
      </div>
    </div>
  );
};
  
  export default MessageBubble;
  