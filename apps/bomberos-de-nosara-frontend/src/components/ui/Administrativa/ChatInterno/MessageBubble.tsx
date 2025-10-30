import { format, formatDistanceToNow, isToday, isThisWeek, isThisYear, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageBubbleProps {
  message: string;
  isOwn: boolean;
  timestamp: string;
  username: string;
  showAvatar?: boolean;
  showUsername?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  timestamp,
  username,
  showAvatar = true,
  showUsername = true,
}) => {
  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    
    if (isThisWeek(date, { weekStartsOn: 1 })) {
      return format(date, 'EEE HH:mm', { locale: es });
    }
    
    if (isThisYear(date)) {
      return format(date, 'd MMM', { locale: es });
    }
    
    return format(date, 'dd/MM/yyyy');
  };
  
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = differenceInDays(now, date);
    
    if (diffInDays === 0) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffInMinutes < 1) return 'Ahora';
      if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `hace ${diffInHours} h`;
    }
    
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return format(date, 'EEEE', { locale: es });
    return format(date, 'dd/MM/yyyy');
  };
  
  const formattedTime = timestamp ? formatMessageTime(timestamp) : '';
  const relativeTime = timestamp ? formatRelativeTime(timestamp) : '';

  const getUserColor = (name: string) => {
    if (isOwn) return {
      bubble: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
      avatar: 'bg-gradient-to-br from-red-100 to-red-200 text-red-600',
      time: 'text-red-100',
      name: 'text-red-300'
    };
    
    const colorSchemes = [
      { bubble: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white', avatar: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600', time: 'text-blue-100', name: '#60a5fa' },
      { bubble: 'bg-gradient-to-br from-green-500 to-green-600 text-white', avatar: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600', time: 'text-green-100', name: '#4ade80' },
      { bubble: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white', avatar: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600', time: 'text-purple-100', name: '#a78bfa' },
      { bubble: 'bg-gradient-to-br from-pink-500 to-pink-600 text-white', avatar: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600', time: 'text-pink-100', name: '#f472b6' },
      { bubble: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white', avatar: 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600', time: 'text-indigo-100', name: '#818cf8' },
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colorSchemes[Math.abs(hash) % colorSchemes.length];
  };

  const colors = getUserColor(username);
  const isGroupChat = showUsername && !isOwn;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-3 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] sm:max-w-[75%] md:max-w-[65%]`}>
        {/* Avatar - Only show for received messages and if not in a group or explicitly shown */}
        {!isOwn && showAvatar && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
            isGroupChat ? 'self-end mb-1' : 'self-end'
          } ${colors.avatar} mr-2`}>
            <span className="text-xs font-semibold">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Message Container */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Username in group chats */}
          {isGroupChat && showUsername && (
            <span className="text-xs font-medium text-red-500 mb-0.5 px-1">
              {username}
            </span>
          )}
          
          {/* Message Bubble */}
          <div className="relative">
            <div 
              className={`px-3 py-2 rounded-lg ${
                isOwn 
                  ? `${colors.bubble} rounded-tr-none` 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <p className="text-sm break-words whitespace-pre-wrap">
                {message}
              </p>
              
              {/* Timestamp and status */}
              <div className={`flex items-center justify-end mt-0.5 space-x-1 min-w-[50px] ${
                isOwn ? 'justify-end' : 'justify-start'
              }`}>
                <span className={`text-[11px] ${isOwn ? colors.time : 'text-gray-500'}`}>
                  {formattedTime}
                </span>
                
                {isOwn && (
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-white opacity-70" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Message status tooltip */}
            <div className={`absolute ${
              isOwn ? 'right-0' : 'left-0'
            } -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
              <div className="bg-gray-800 text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap">
                {timestamp ? format(new Date(timestamp), "EEEE d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }) : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
  