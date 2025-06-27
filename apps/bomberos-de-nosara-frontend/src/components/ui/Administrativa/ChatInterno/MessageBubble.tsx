interface Props {
    message: string;
    from: 'user' | 'admin';
  }
  
  const MessageBubble = ({ message, from }: Props) => {
    const isUser = from === 'user';
    return (
      <div className={`my-2 flex ${isUser ? 'justify-start' : 'justify-end'}`}>
        <div className={`px-4 py-2 rounded-lg max-w-xs ${isUser ? 'bg-gray-200' : 'bg-red-200'}`}>
          <p>{message}</p>
        </div>
      </div>
    );
  };
  
  export default MessageBubble;
  