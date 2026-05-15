import { toast } from 'react-hot-toast';

/**
 * Utilidad global para notificaciones estilizadas.
 * Basado en react-hot-toast para mantener la coherencia y facilidad de uso.
 */
export const notify = {
  success: (message: string) => toast.success(message, {
    duration: 4000,
    style: {
      borderRadius: '12px',
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      fontSize: '14px',
      fontWeight: '600'
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: '#fff',
    },
  }),
  
  error: (message: string) => toast.error(message, {
    duration: 5000,
    style: {
      borderRadius: '12px',
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      fontSize: '14px',
      fontWeight: '600'
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  }),
  
  info: (message: string) => toast(message, {
    duration: 4000,
    icon: 'ℹ️',
    style: {
      borderRadius: '12px',
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
      fontSize: '14px',
      fontWeight: '600'
    },
  }),

  loading: (message: string) => toast.loading(message, {
    style: {
      borderRadius: '12px',
      background: '#ffffff',
      color: '#374151',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      fontWeight: '600'
    },
  }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),
};
