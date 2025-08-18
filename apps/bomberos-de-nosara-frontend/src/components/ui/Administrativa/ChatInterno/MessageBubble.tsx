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

  // Different colors for different users (using a simple hash function)
  const getUserColor = (name: string) => {
    if (isOwn) return 'bg-red-600 text-white';
    
    // Generate a consistent color based on username
    const colors = [
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-teal-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
      'bg-cyan-500 text-white',
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const bubbleColor = getUserColor(username);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 px-2`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[90%]`}>
        {/* Avatar */}
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'} ${isOwn ? 'bg-red-100' : 'bg-gray-200'}`}
        >
          <span className={`text-sm font-medium ${isOwn ? 'text-red-600' : 'text-gray-600'}`}>
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Message Container */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Username */}
          {!isOwn && (
            <span className="text-xs font-medium text-gray-600 mb-1">
              {username}
            </span>
          )}
          
          {/* Message Bubble */}
          <div 
            className={`px-4 py-2.5 rounded-2xl ${isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'} ${isOwn ? bubbleColor : 'bg-gray-100 text-gray-800'}`}
          >
            <p className="text-sm break-words">{message}</p>
          </div>
          
          {/* Timestamp */}
          <span className={`text-xs mt-1 ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
  