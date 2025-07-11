/**
 * EditUserModal Component
 * Modern modal for editing user information in admin panel
 * Features iOS 18/macOS 26 inspired frosted glass design
 */

'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
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
      className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-border/30"
        style={{ background: "var(--surface-light)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 sticky top-0 bg-surface/90 backdrop-blur-2xl z-10">
          <h2 className="text-xl font-semibold text-text">
            {t('admin.users.edit.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text hover:bg-surface-light rounded-xl transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-text-secondary">{t('common.loading')}</div>
            </div>
          ) : user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info Section */}
              <div className="rounded-xl p-5 border border-border/20" style={{ background: "var(--surface-light)" }}>
                <h3 className="font-semibold text-text mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('admin.users.edit.basicInfo')}
                </h3>
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
                      className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background/80 backdrop-blur-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background/80 backdrop-blur-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                    >
                      <option value="ACTIVE">{t('admin.users.status.active')}</option>
                      <option value="BANNED">{t('admin.users.status.banned')}</option>
                      <option value="PENDING">{t('admin.users.status.pending')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email Verification Toggle */}
              <div className="flex items-center justify-between p-5 bg-surface-light/60 backdrop-blur-sm rounded-xl border border-border/20">
                <div>
                  <h3 className="font-semibold text-text mb-1">{t('admin.users.edit.emailVerification')}</h3>
                  <p className="text-sm text-text-secondary">{t('admin.users.edit.emailVerificationDesc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEmailVerified}
                    onChange={(e) => handleInputChange('isEmailVerified', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-border/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* User Stats (Read-only) */}
              <div className="rounded-xl p-5 border border-border/20" style={{ background: "var(--surface-light)" }}>
                <h3 className="font-semibold text-text mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('admin.users.edit.userStats')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                    <span className="text-text-secondary block mb-1">{t('admin.users.edit.joined')}:</span>
                    <div className="font-semibold text-text">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                    <span className="text-text-secondary block mb-1">{t('admin.users.edit.uploaded')}:</span>
                    <div className="font-semibold text-text">
                      {(parseInt(user.uploaded) / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </div>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                    <span className="text-text-secondary block mb-1">{t('admin.users.edit.downloaded')}:</span>
                    <div className="font-semibold text-text">
                      {(parseInt(user.downloaded) / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </div>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                    <span className="text-text-secondary block mb-1">{t('admin.users.edit.ratio')}:</span>
                    <div className="font-semibold text-text">{user.ratio.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Invitations Section */}
              <div className="rounded-xl p-5 border border-border/20" style={{ background: "var(--surface-light)" }}>
                <h3 className="font-semibold text-text mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('admin.users.edit.invitations.title')}
                </h3>
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
                    <p className="text-xs text-text-secondary mt-2">
                      {t('admin.users.edit.invitations.description')}
                    </p>
                    {formData.role !== 'ADMIN' && (
                      <p className="text-xs text-orange-600 mt-1">
                        {t('admin.users.edit.invitations.maxLimit', { count: maxInvitesPerUser })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-text-secondary">{t('admin.users.edit.invitations.currentRole')}:</span>
                      <span className={`ml-2 font-semibold ${
                        formData.role === 'ADMIN' ? 'text-red-500' : 
                        formData.role === 'MODERATOR' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        {formData.role}
                      </span>
                    </div>
                    {formData.role === 'ADMIN' && (
                      <div className="text-xs text-green-600 bg-green-50/80 dark:bg-green-900/30 p-3 rounded-lg border border-green-200/50 dark:border-green-800/30 backdrop-blur-sm">
                        {t('admin.users.edit.invitations.adminUnlimited')}
                      </div>
                    )}
                    {formData.role !== 'ADMIN' && (
                      <div className="text-xs text-blue-600 bg-blue-50/80 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                        {t('admin.users.edit.invitations.userLimit')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-border/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-text-secondary hover:text-text hover:bg-surface-light rounded-xl transition-all duration-300 font-medium"
                >
                  {t('admin.users.edit.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2.5 bg-primary text-background rounded-xl hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {saving ? t('admin.users.edit.saving') : t('admin.users.edit.save')}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="text-error">{t('admin.users.edit.userNotFound')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 