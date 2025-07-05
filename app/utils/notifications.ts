/**
 * Notifications utility
 * Provides functions for showing toast notifications
 */

import toast from 'react-hot-toast';

export const showNotification = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--error)',
      },
    });
  },
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'bottom-right',
      icon: '⚠️',
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--yellow)',
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'bottom-right',
      icon: 'ℹ️',
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--primary)',
      },
    });
  },
}; 