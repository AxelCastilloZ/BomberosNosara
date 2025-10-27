import ChatWindow from '../../components/ui/Administrativa/ChatInterno/ChatWindow';

const AdminChatPage=() => {
  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-red-700">Chat Interno</h1>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[calc(100%-4rem)]">
        <ChatWindow />
      </div>
    </div>
  );
};

export default AdminChatPage;
