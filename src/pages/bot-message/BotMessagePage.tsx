import React, { useState, useEffect, useRef } from 'react';
import * as chatService from '../../services/chatService';
import { faqService } from '../../services/faq/faqService';
import { FaRobot, FaComments, FaGraduationCap } from 'react-icons/fa';
import ConversationsTab from './tabs/ConversationsTab';
import TrainingTab from './tabs/TrainingTab';

type TabType = 'conversations' | 'training';

const BotMessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  
  // State for Chat logic (Shared or scoped to tab)
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'conversations') {
      loadChats();
      const interval = setInterval(loadChats, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await chatService.getChats();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando chats", err);
    }
  };

  const handleSelectChat = async (chat: any) => {
    setSelectedChat(chat);
    try {
      const data = await chatService.getMessages(chat._id.platform, chat._id.platform_id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando mensajes", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);
    try {
      await chatService.sendMessage(selectedChat._id.platform, selectedChat._id.platform_id, newMessage);
      setNewMessage('');
      const data = await chatService.getMessages(selectedChat._id.platform, selectedChat._id.platform_id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("No se pudo enviar el mensaje");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToFAQ = async (text: string) => {
    const question = window.prompt("Escribe la pregunta para esta FAQ:", text);
    if (!question) return;
    const answer = window.prompt("Escribe la respuesta oficial:");
    if (!answer) return;

    try {
      await faqService.createFAQ({
        question,
        answer,
        category: 'general',
        status: 'active',
        order: 0
      });
      alert("Mila ha aprendido algo nuevo.");
    } catch (err) {
      alert("Error al crear la FAQ");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaRobot className="text-indigo-600" /> Mila AI
          </h1>
          <p className="text-sm text-gray-500">Supervisión y Entrenamiento del Asistente Virtual</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-2xl shadow-sm border w-fit">
        <button 
          onClick={() => setActiveTab('conversations')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'conversations' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FaComments /> Conversaciones
        </button>
        <button 
          onClick={() => setActiveTab('training')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'training' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FaGraduationCap /> Entrenamiento
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0">
        <div className="h-[calc(100vh-220px)] lg:h-[calc(100vh-200px)]">
          {activeTab === 'conversations' ? (
            <ConversationsTab 
              chats={chats}
              selectedChat={selectedChat}
              messages={messages}
              newMessage={newMessage}
              loading={loading}
              onSelectChat={handleSelectChat}
              onSendMessage={handleSendMessage}
              onNewMessageChange={setNewMessage}
              onConvertToFAQ={handleConvertToFAQ}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <TrainingTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotMessagePage;
