import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  BookOpenIcon, 
  ViewColumnsIcon, 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { AdminSidebarProps } from './types';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Cursos', href: '/admin/courses', icon: BookOpenIcon },
  { name: 'Inscripciones', href: '/admin/dashboard', icon: UsersIcon }, 
  { name: 'Carrusel', href: '/admin/carousel', icon: ViewColumnsIcon },
  { name: 'Talleres', href: '/admin/workshops', icon: CalendarIcon },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const filteredNavigation = navigation.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 px-4 bg-slate-800/50">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold tracking-wider text-indigo-400"
          >
            MODISTA <span className="text-white">ADMIN</span>
          </motion.span>
        )}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1 rounded-md hover:bg-slate-700"
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 py-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 transition-all"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavigation.map((item) => {
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className={`w-6 h-6 shrink-0`} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold">Admin</p>
              <p className="text-[10px] text-slate-400">Panel de Control</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
