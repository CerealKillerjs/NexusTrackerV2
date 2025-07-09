/**
 * EditUserModal Component
 * Modal for editing user information in admin panel
 * Includes email verification toggle and user status management
 */

'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import { X } from '@styled-icons/boxicons-regular/X';
import { Save } from '@styled-icons/boxicons-regular/Save';
import { showNotification } from '@/app/utils/notifications';
import { FormField } from "@/app/components/ui/FigmaFloatingLabelInput"

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onUserUpdated: () => void;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  isEmailVerified: boolean;
  createdAt: string;
  uploaded: string;
  downloaded: string;
  ratio: number;
  bonusPoints: number;
  passkey: string;
  uploadCount: number;
  availableInvites: number;
}

export default function EditUserModal({ isOpen, onClose, userId, onUserUpdated }: EditUserModalProps) {
  const { t } = useI18n();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    id: '',
    username: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    isEmailVerified: false,
    createdAt: '',
    uploaded: '0',
    downloaded: '0',
    ratio: 0,
    bonusPoints: 0,
    passkey: '',
    uploadCount: 0,
    availableInvites: 0
  });
  const [maxInvitesPerUser, setMaxInvitesPerUser] = useState<number>(5);

  // Fetch user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
      fetchMaxInvitesLimit();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData: UserData = await response.json();
      setUser(userData);
      setFormData({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        uploaded: userData.uploaded,
        downloaded: userData.downloaded,
        ratio: userData.ratio,
        bonusPoints: userData.bonusPoints,
        passkey: userData.passkey,
        uploadCount: userData.uploadCount,
        availableInvites: userData.availableInvites
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      showNotification.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaxInvitesLimit = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        const maxInvites = data.config?.MAX_INVITES_PER_USER;
        if (maxInvites) {
          setMaxInvitesPerUser(parseInt(maxInvites, 10));
        }
      }
    } catch (error) {
      console.error('Error fetching max invites limit:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification.success('User updated successfully');
        onUserUpdated();
        onClose();
      } else {
        showNotification.error(data.error || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification.error('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text">
            {t('admin.users.edit.title')}
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
          {loading ? (
            <div className="text-center py-8">
              <div className="text-text-secondary">{t('common.loading')}</div>
            </div>
          ) : user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormField
                    label={t('admin.users.edit.username')}
                    value={formData.username}
                    onChange={val => handleInputChange('username', val)}
                    className="w-full"
                  />
                </div>

                <div>
                  <FormField
                    label={t('admin.users.edit.email')}
                    value={formData.email}
                    onChange={val => handleInputChange('email', val)}
                    className="w-full"
                    type="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('admin.users.edit.role')}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="USER">{t('admin.users.roles.user')}</option>
                    <option value="MODERATOR">{t('admin.users.roles.moderator')}</option>
                    <option value="ADMIN">{t('admin.users.roles.admin')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('admin.users.edit.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="ACTIVE">{t('admin.users.status.active')}</option>
                    <option value="BANNED">{t('admin.users.status.banned')}</option>
                    <option value="PENDING">{t('admin.users.status.pending')}</option>
                  </select>
                </div>
              </div>

              {/* Email Verification Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                <div>
                  <h3 className="font-medium text-text">{t('admin.users.edit.emailVerification')}</h3>
                  <p className="text-sm text-text-secondary">{t('admin.users.edit.emailVerificationDesc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEmailVerified}
                    onChange={(e) => handleInputChange('isEmailVerified', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* User Stats (Read-only) */}
              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="font-medium text-text mb-3">{t('admin.users.edit.userStats')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">{t('admin.users.edit.joined')}:</span>
                    <div className="font-medium text-text">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-secondary">{t('admin.users.edit.uploaded')}:</span>
                    <div className="font-medium text-text">
                      {(parseInt(user.uploaded) / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </div>
                  </div>
                  <div>
                    <span className="text-text-secondary">{t('admin.users.edit.downloaded')}:</span>
                    <div className="font-medium text-text">
                      {(parseInt(user.downloaded) / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </div>
                  </div>
                  <div>
                    <span className="text-text-secondary">{t('admin.users.edit.ratio')}:</span>
                    <div className="font-medium text-text">{user.ratio.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Invitations Section */}
              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="font-medium text-text mb-3">{t('admin.users.edit.invitations.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      {t('admin.users.edit.invitations.available')}
                    </label>
                    <FormField
                      label={t('admin.users.edit.invitations.available')}
                      value={String(formData.availableInvites)}
                      onChange={val => handleInputChange('availableInvites', parseInt(val) || 0)}
                      className="w-full"
                      type="number"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      {t('admin.users.edit.invitations.description')}
                    </p>
                    {formData.role !== 'ADMIN' && (
                      <p className="text-xs text-orange-600 mt-1">
                        {t('admin.users.edit.invitations.maxLimit', { count: maxInvitesPerUser })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-text-secondary">{t('admin.users.edit.invitations.currentRole')}:</span>
                      <span className={`ml-2 font-medium ${
                        formData.role === 'ADMIN' ? 'text-red-500' : 
                        formData.role === 'MODERATOR' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        {formData.role}
                      </span>
                    </div>
                    {formData.role === 'ADMIN' && (
                      <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        {t('admin.users.edit.invitations.adminUnlimited')}
                      </div>
                    )}
                    {formData.role !== 'ADMIN' && (
                      <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        {t('admin.users.edit.invitations.userLimit')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-text-secondary hover:text-text hover:bg-surface-light rounded-md transition-colors"
                >
                  {t('admin.users.edit.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Save size={16} className="mr-2" />
                  {saving ? t('admin.users.edit.saving') : t('admin.users.edit.save')}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-error">{t('admin.users.edit.userNotFound')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 