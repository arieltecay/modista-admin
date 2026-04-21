import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="ml-4 text-lg font-bold text-indigo-600">MODISTA ADMIN</span>
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
