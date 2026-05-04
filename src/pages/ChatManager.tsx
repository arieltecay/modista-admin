import React, { useEffect, useState } from 'react';
import * as chatService from '../services/chatService';
import ConnectionBanner from '../components/ConnectionBanner';

const ChatManager = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    chatService.getChats().then(res => setChats(res.data));
  }, []);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    chatService.getMessages(chat._id.platform, chat._id.platform_id)
      .then(res => setMessages(res.data));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Conversaciones</h1>
      <ConnectionBanner />
      
      <div className="flex gap-6 h-[600px]">
        {/* Sidebar de Chats */}
        <div className="w-1/3 border rounded p-4 overflow-y-auto">
          {chats.map((chat: any) => (
            <div 
              key={`${chat._id.platform}-${chat._id.platform_id}`}
              onClick={() => handleSelectChat(chat)}
              className="p-3 border-b cursor-pointer hover:bg-gray-100"
            >
              <p className="font-semibold">{chat._id.platform_id}</p>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          ))}
        </div>

        {/* Panel de mensajes */}
        <div className="w-2/3 border rounded p-4 flex flex-col">
          {selectedChat ? (
            <>
              <h2 className="font-bold mb-4">Chat con {selectedChat._id.platform_id}</h2>
              <div className="flex-1 overflow-y-auto border p-2 mb-4 bg-gray-50">
                {messages.map((msg: any) => (
                  <div key={msg._id} className={`mb-2 ${msg.direction === 'inbound' ? 'text-left' : 'text-right'}`}>
                    <span className={`inline-block p-2 rounded ${msg.direction === 'inbound' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {msg.body}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Selecciona un chat para ver la conversación
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManager;
