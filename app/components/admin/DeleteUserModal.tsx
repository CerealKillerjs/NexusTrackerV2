/**
 * DeleteUserModal Component
 * Confirmation modal for deleting users in admin panel
 * Shows user information and requires confirmation
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import { X } from '@styled-icons/boxicons-regular/X';
import { Trash } from '@styled-icons/boxicons-regular/Trash';
import { Error } from '@styled-icons/boxicons-regular/Error';
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text">
            {t('admin.users.delete.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text hover:bg-surface-light rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Error size={32} className="text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-text mb-2">
              {t('admin.users.delete.confirmTitle')}
            </h3>
            <p className="text-text-secondary">
              {t('admin.users.delete.confirmMessage')}
            </p>
          </div>

          {/* User Information */}
          <div className="bg-surface-light rounded-lg p-4 mb-6">
            <h4 className="font-medium text-text mb-3">{t('admin.users.delete.userInfo')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('admin.users.delete.username')}:</span>
                <span className="font-medium text-text">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('admin.users.delete.email')}:</span>
                <span className="font-medium text-text">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('admin.users.delete.role')}:</span>
                <span className="font-medium text-text">{t(`admin.users.roles.${user.role.toLowerCase()}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('admin.users.delete.status')}:</span>
                <span className="font-medium text-text">{t(`admin.users.status.${user.status.toLowerCase()}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('admin.users.delete.uploads')}:</span>
                <span className="font-medium text-text">{user.uploadCount}</span>
              </div>
            </div>
          </div>

          {/* Warning Details */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Error size={20} className="text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium mb-1">{t('admin.users.delete.warningTitle')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('admin.users.delete.warningUploads')}</li>
                  <li>{t('admin.users.delete.warningComments')}</li>
                  <li>{t('admin.users.delete.warningBookmarks')}</li>
                  <li>{t('admin.users.delete.warningVotes')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-text-secondary hover:text-text hover:bg-surface-light rounded-md transition-colors disabled:opacity-50"
            >
              {t('admin.users.delete.cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash size={16} className="mr-2" />
              {deleting ? t('admin.users.delete.deleting') : t('admin.users.delete.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 