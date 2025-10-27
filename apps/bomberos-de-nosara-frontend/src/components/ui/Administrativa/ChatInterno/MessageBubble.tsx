import { format, formatDistanceToNow, isToday, isThisWeek, isThisYear, differenceInDays } from 'date-fns';
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
  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // For messages from today, show time (e.g., "14:30")
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    
    // For messages from this week, show day and time (e.g., "Lun 14:30")
    if (isThisWeek(date, { weekStartsOn: 1 })) {
      return format(date, 'EEE HH:mm', { locale: es });
    }
    
    // For messages from this year, show month, day and time (e.g., "15 Ago 14:30")
    if (isThisYear(date)) {
      return format(date, 'd MMM HH:mm', { locale: es });
    }
    
    // For older messages, show full date and time (e.g., "15/08/2023 14:30")
    return format(date, 'dd/MM/yyyy HH:mm');
  };
  
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = differenceInDays(now, date);
    
    // For messages less than 1 hour old, show "hace X minutos"
    if (diffInDays === 0) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffInMinutes < 60) {
        return `hace ${diffInMinutes} min`;
      }
      // For messages less than 24 hours old, show "hace X horas"
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `hace ${diffInHours} h`;
    }
    
    // For messages from yesterday, show "Ayer"
    if (diffInDays === 1) return 'Ayer';
    
    // For messages within a week, show day name
    if (diffInDays < 7) return format(date, 'EEEE', { locale: es });
    
    // For older messages, show date
    return format(date, 'dd/MM/yyyy');
  };
  
  const formattedTime = timestamp ? formatMessageTime(timestamp) : '';
  const relativeTime = timestamp ? formatRelativeTime(timestamp) : '';

  // Enhanced color system with gradients for better visual appeal
  const getUserColor = (name: string) => {
    if (isOwn) return {
      bubble: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md',
      avatar: 'bg-gradient-to-br from-red-100 to-red-200 text-red-600'
    };
    
    // Generate consistent colors based on username with gradients
    const colorSchemes = [
      {
        bubble: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
      },
      {
        bubble: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600'
      },
      {
        bubble: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600'
      },
      {
        bubble: 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600'
      },
      {
        bubble: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600'
      },
      {
        bubble: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600'
      },
      {
        bubble: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600'
      },
      {
        bubble: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md',
        avatar: 'bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600'
      }
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colorSchemes[Math.abs(hash) % colorSchemes.length];
  };

  const colors = getUserColor(username);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 px-1 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[85%] lg:max-w-[70%]`}>
        {/* Enhanced Avatar */}
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOwn ? 'ml-3' : 'mr-3'
          } ${colors.avatar} shadow-sm transition-all duration-200 group-hover:shadow-md`}
        >
          <span className="text-sm font-semibold">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Enhanced Message Container */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-full`}>
          {/* Username with better styling */}
          {!isOwn && (
            <span className="text-xs font-semibold text-gray-600 mb-1.5 px-1">
              {username}
            </span>
          )}
          
          {/* Enhanced Message Bubble */}
          <div className="relative group/bubble">
            <div 
              className={`px-4 py-3 rounded-2xl ${
                isOwn ? 'rounded-br-md' : 'rounded-bl-md'
              } ${
                isOwn 
                  ? colors.bubble 
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm hover:shadow-md'
              } transition-all duration-200 transform hover:scale-[1.02] hover:-translate-y-0.5`}
            >
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message}
              </p>
              
              {/* Message status indicator for own messages */}
              {isOwn && (
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Hover timestamp tooltip */}
            <div className={`absolute ${
              isOwn ? 'right-0' : 'left-0'
            } -bottom-6 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 pointer-events-none`}>
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                {timestamp ? format(new Date(timestamp), "EEEE d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }) : ''}
              </div>
            </div>
          </div>
          
          {/* Enhanced Timestamp */}
          <div className={`flex items-center mt-1.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`text-xs font-medium ${
              isOwn ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {formattedTime}
            </span>
            
            {/* Delivery status for own messages */}
            {isOwn && (
              <div className="flex items-center ml-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
  