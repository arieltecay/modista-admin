import React from 'react';
import { FaPaperPlane, FaRobot, FaUserEdit } from 'react-icons/fa';

interface ConversationsTabProps {
  chats: any[];
  selectedChat: any;
  messages: any[];
  newMessage: string;
  loading: boolean;
  onSelectChat: (chat: any) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onNewMessageChange: (val: string) => void;
  onConvertToFAQ: (text: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ConversationsTab: React.FC<ConversationsTabProps> = ({
  chats,
  selectedChat,
  messages,
  newMessage,
  loading,
  onSelectChat,
  onSendMessage,
  onNewMessageChange,
  onConvertToFAQ,
  messagesEndRef
}) => {
  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar de Chats */}
      <div className="w-1/3 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">Conversaciones Recientes</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat: any) => (
            <div 
              key={`${chat._id.platform}-${chat._id.platform_id}`}
              onClick={() => onSelectChat(chat)}
              className={`p-4 border-b cursor-pointer transition-colors hover:bg-indigo-50 ${selectedChat?._id.platform_id === chat._id.platform_id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-indigo-900">+{chat._id.platform_id}</p>
                <span className="text-[10px] text-gray-400">{new Date(chat.lastTimestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de mensajes */}
      <div className="w-2/3 bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden">
        {selectedChat ? (
          <>
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Chat con {selectedChat._id.platform_id}</h2>
              <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">WhatsApp Oficial</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg: any) => (
                <div key={msg._id} className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] group relative`}>
                    <div className={`p-3 rounded-2xl shadow-sm ${msg.direction === 'inbound' ? 'bg-white text-gray-800 rounded-tl-none border' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                      {msg.body}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {msg.direction === 'inbound' && (
                        <button 
                          onClick={() => onConvertToFAQ(msg.body)}
                          className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity"
                          title="Guardar como FAQ"
                        >
                          <FaUserEdit /> Entrenar Mila
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={onSendMessage} className="p-4 border-t bg-white flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => onNewMessageChange(e.target.value)}
                placeholder="Escribe una respuesta manual..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !newMessage.trim()}
                className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <FaRobot size={60} className="text-gray-200" />
            <p>Selecciona un chat para supervisar a Mila AI</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsTab;
