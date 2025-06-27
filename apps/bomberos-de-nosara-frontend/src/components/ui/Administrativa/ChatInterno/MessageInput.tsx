import { useState } from 'react';

const MessageInput = () => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    console.log("Mensaje enviado:", input);
    setInput('');
  };

  return (
    <div className="flex p-2 border-t">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        className="flex-1 p-2 border rounded-l"
        placeholder="Escribe un mensaje..."
      />
      <button onClick={handleSend} className="bg-red-600 text-white px-4 rounded-r">
        Enviar
      </button>
    </div>
  );
};

export default MessageInput;
