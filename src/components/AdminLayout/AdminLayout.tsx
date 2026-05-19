import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { Bars3Icon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      <div className={`
        fixed inset-0 z-40 lg:hidden transition-opacity duration-300
        ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
        <div className={`
          relative flex flex-col w-64 h-full bg-slate-900 transition-transform duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <AdminSidebar onClose={() => setIsMobileSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="hidden lg:block text-xl font-bold text-slate-800">Panel de Gestión</span>
            <span className="lg:hidden ml-4 text-lg font-bold text-indigo-600">MODISTA ADMIN</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell / Chat Icon */}
            <button 
              onClick={() => navigate('/admin/chat')}
              className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none bg-gray-50 rounded-full"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-pulse">
                  {unreadCount > 9 ? '+9' : unreadCount}
                </span>
              )}
            </button>
            
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-inner">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
