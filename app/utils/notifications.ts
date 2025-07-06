/**
 * Notifications Utility
 * Enhanced notification system using react-hot-toast
 */

import toast from 'react-hot-toast';

export const showNotification = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#EF4444',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 4000,
      style: {
        background: '#3B82F6',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  }
}; 