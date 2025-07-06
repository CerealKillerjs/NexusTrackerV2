/**
 * Profile Page
 * Displays user profile information and settings
 * Includes sections for avatar management, user info, statistics, and recent activity
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useI18n } from '../hooks/useI18n';
import { useLanguage } from '../hooks/useLanguage';
import { showNotification } from '../utils/notifications';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import RecentActivity from '../components/profile/RecentActivity';
import { UserProfile } from '../types/profile';

// Mock profile data
const mockProfile: UserProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  joinDate: '2024-01-15',
  avatar: null,
  stats: {
    uploaded: '1.5 TB',
    downloaded: '500 GB',
    ratio: 3.0,
    points: 1500,
    rank: 'Power User'
  },
  preferences: {
    notifications: true,
    privateProfile: false,
    language: 'en',
    theme: 'dark'
  }
};

export default function ProfilePage() {
  const { t } = useI18n();
  const { currentLanguage } = useLanguage();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar removal
  const handleRemoveAvatar = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  // Get locale for date formatting
  const getLocale = useCallback(() => {
    switch (currentLanguage) {
      case 'es': return es;
      default: return enUS;
    }
  }, [currentLanguage]);

  // Generate announce URL for torrent clients (placeholder)
  const announceUrl = session?.user?.id 
    ? `${process.env.NEXT_PUBLIC_TRACKER_URL || 'http://tracker.example.com'}/announce?passkey=${session.user.id}`
    : '';

  // Copy announce URL to clipboard
  const copyAnnounceUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(announceUrl);
      showNotification.success(t('profile.notification.announceCopied'));
    } catch {
      showNotification.error(t('profile.notification.copyError'));
    }
  }, [announceUrl, t]);

  // Format join date (using mock data for now)
  const formattedJoinDate = profile.joinDate 
    ? format(new Date(profile.joinDate), 'PPP', { locale: getLocale() })
    : '';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background text-text p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">
            {t('profile.title')}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar with avatar and user info */}
            <div className="space-y-6">
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-background">
                    {(previewUrl || profile.avatar) ? (
                      <Image
                        src={previewUrl || profile.avatar!}
                        alt="Profile avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Avatar buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 bg-primary text-background rounded hover:bg-primary-dark transition-colors text-sm"
                    >
                      {t('profile.actions.uploadAvatar')}
                    </button>
                    {(previewUrl || profile.avatar) && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-2 border border-border rounded hover:border-error hover:text-error transition-colors text-sm"
                      >
                        {t('profile.actions.removeAvatar')}
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          showNotification.error(t('profile.notification.invalidImage'));
                          return;
                        }
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url);
                      }
                    }}
                  />

                  {/* User Info and Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.username')}</span>
                      <span className="font-medium">{session?.user?.username || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.email')}</span>
                      <span className="font-medium">{session?.user?.email || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.ratio')}</span>
                      <span className="font-medium">{profile.stats.ratio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.points')}</span>
                      <span className="font-medium">{profile.stats.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.rank')}</span>
                      <span className="font-medium">{profile.stats.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.joinDate')}</span>
                      <span className="font-medium">{formattedJoinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {/* Detailed statistics */}
              <section className="bg-surface rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">{t('profile.sections.stats')}</h2>
                <div className="space-y-6">
                  {/* Announce URL */}
                  <div className="space-y-2">
                    <label className="block text-sm text-text-secondary">
                      {t('profile.fields.announceUrl')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={announceUrl}
                        readOnly
                        className="flex-1 p-2 bg-background border border-border rounded 
                                   text-text font-mono text-sm"
                      />
                      <button
                        onClick={copyAnnounceUrl}
                        className="px-4 py-2 bg-primary text-background rounded hover:bg-primary-dark 
                                   transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="text-sm">{t('common.copy')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm text-text-secondary">
                        {t('profile.fields.uploaded')}
                      </span>
                      <span className="text-lg font-medium text-green">{profile.stats.uploaded}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-text-secondary">
                        {t('profile.fields.downloaded')}
                      </span>
                      <span className="text-lg font-medium text-primary">{profile.stats.downloaded}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section className="bg-surface rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">{t('profile.sections.preferences')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>{t('profile.preferences.notifications')}</span>
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, notifications: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('profile.preferences.privateProfile')}</span>
                    <input
                      type="checkbox"
                      checked={profile.preferences.privateProfile}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, privateProfile: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 