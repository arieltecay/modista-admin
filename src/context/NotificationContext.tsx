import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/config/apiClient';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/dashboard/unread-messages');
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('[NotificationContext] Error al refrescar notificaciones:', error);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    // Polling cada 60 segundos
    const interval = setInterval(refreshUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};
