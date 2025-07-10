/**
 * DeleteUserModal Component
 * Modern confirmation modal for deleting users in admin panel
 * Features iOS 18/macOS 26 inspired frosted glass design
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import { showNotification } from '@/app/utils/notifications';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    uploadCount: number;
  } | null;
  onUserDeleted: () => void;
}

export default function DeleteUserModal({ isOpen, onClose, user, onUserDeleted }: DeleteUserModalProps) {
  const { t } = useI18n();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showNotification.success(data.message || 'User deleted successfully');
        onUserDeleted();
        onClose();
      } else {
        showNotification.error(data.error || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification.error('Error deleting user');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface/90 backdrop-blur-2xl border border-border/30 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold text-text">
            {t('admin.users.delete.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text hover:bg-surface-light rounded-xl transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-red-200/50 dark:border-red-800/30">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-center mb-4">
            <h3 className="text-base font-semibold text-text mb-2">
              {t('admin.users.delete.confirmTitle')}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('admin.users.delete.confirmMessage')}
            </p>
          </div>

          {/* User Information */}
          <div className="bg-surface-light/60 backdrop-blur-sm rounded-xl p-3 mb-4 border border-border/20">
            <h4 className="font-semibold text-text mb-3 flex items-center text-sm">
              <svg className="w-3 h-3 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('admin.users.delete.userInfo')}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">{t('admin.users.delete.username')}:</span>
                <span className="font-semibold text-text">{user.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">{t('admin.users.delete.email')}:</span>
                <span className="font-semibold text-text truncate ml-2">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">{t('admin.users.delete.role')}:</span>
                <span className="font-semibold text-text">{t(`admin.users.roles.${user.role.toLowerCase()}`)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">{t('admin.users.delete.uploads')}:</span>
                <span className="font-semibold text-text">{user.uploadCount}</span>
              </div>
            </div>
          </div>

          {/* Warning Details */}
          <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 rounded-xl p-3 mb-4">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-xs text-red-800 dark:text-red-200">
                <p className="font-semibold mb-1">{t('admin.users.delete.warningTitle')}</p>
                <ul className="space-y-0.5">
                  <li className="flex items-start">
                    <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                    {t('admin.users.delete.warningUploads')}
                  </li>
                  <li className="flex items-start">
                    <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                    {t('admin.users.delete.warningComments')}
                  </li>
                  <li className="flex items-start">
                    <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                    {t('admin.users.delete.warningBookmarks')}
                  </li>
                  <li className="flex items-start">
                    <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                    {t('admin.users.delete.warningVotes')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-text-secondary hover:text-text hover:bg-surface-light rounded-xl transition-all duration-300 disabled:opacity-50 font-medium text-sm"
            >
              {t('admin.users.delete.cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50 font-medium text-sm shadow-lg hover:shadow-xl"
            >
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deleting ? t('admin.users.delete.deleting') : t('admin.users.delete.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 