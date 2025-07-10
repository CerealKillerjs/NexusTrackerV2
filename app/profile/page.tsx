/**
 * Profile Page
 * Displays user profile information and settings
 * Includes sections for avatar management, user info, statistics, and recent activity
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

// Extension of session user type to include passkey
interface SessionUser {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  image?: string | null;
  role: string;
  passkey?: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const { currentLanguage } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Invitation states
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteLink, setInviteLink] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [availableInvites, setAvailableInvites] = useState<number>(0);
  const [registrationMode, setRegistrationMode] = useState<string>('open');
  const [activeInvites, setActiveInvites] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [maxInvitesPerUser, setMaxInvitesPerUser] = useState<number>(5);

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

  // Generate announce URL for the authenticated user
  const announceUrl = user?.passkey
    ? `${typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http'}://${typeof window !== 'undefined' ? window.location.host : (process.env.NEXT_PUBLIC_TRACKER_URL?.replace(/^https?:\/\//, '') || 'localhost:3001')}/announce?passkey=${user.passkey}`
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

  // Fetch invite data
  const fetchInviteData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Use public endpoints
      const [settingsResponse, userResponse, invitesResponse, configResponse] = await Promise.all([
        fetch('/api/config/registration-mode'),
        fetch('/api/user/current'),
        fetch('/api/user/invites'),
        fetch('/api/admin/settings')
      ]);

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        setRegistrationMode(settings.registrationMode || 'open');
      }

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setAvailableInvites(userData.user.availableInvites || 0);
        }
      }

      if (invitesResponse.ok) {
        const invitesData = await invitesResponse.json();
        setActiveInvites(invitesData.invites || []);
      }

      if (configResponse.ok) {
        const configData = await configResponse.json();
        const maxInvites = configData.config?.MAX_INVITES_PER_USER;
        if (maxInvites) {
          setMaxInvitesPerUser(parseInt(maxInvites, 10));
        }
      }
    } catch (error) {
      console.error('Error fetching invite data:', error);
    }
  }, [user]);

  // Create invitation
  const createInvite = useCallback(async () => {
    if (!user) return;
    
    try {
      setInviteLoading(true);
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const { code, inviteLink } = await response.json();
        setInviteCode(code);
        setInviteLink(inviteLink);
        showNotification.success(t('profile.invitations.create.success'));
        // Refresh stats
        await fetchInviteData();
      } else {
        const error = await response.json();
        showNotification.error(error.error || t('profile.invitations.create.error'));
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      showNotification.error(t('profile.invitations.create.error'));
    } finally {
      setInviteLoading(false);
    }
  }, [user, fetchInviteData, t]);

  // Copy invite link to clipboard
  const copyInviteLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showNotification.success(t('profile.invitations.generated.copied'));
    } catch {
      showNotification.error(t('profile.invitations.generated.copyError'));
    }
  }, [inviteLink, t]);

  // Cancel invitation
  const cancelInvite = useCallback(async (inviteId: string) => {
    try {
      setLoadingInvites(true);
      const response = await fetch(`/api/user/invites?id=${inviteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification.success(t('profile.invitations.active.cancelSuccess'));
        // Refresh data
        await fetchInviteData();
      } else {
        const error = await response.json();
        showNotification.error(error.error || t('profile.invitations.active.cancelError'));
      }
    } catch (error) {
      console.error('Error canceling invite:', error);
      showNotification.error(t('profile.invitations.active.cancelError'));
    } finally {
      setLoadingInvites(false);
    }
  }, [fetchInviteData, t]);

  // Load invite data on component mount
  useEffect(() => {
    if (user) {
      fetchInviteData();
    }
  }, [user, fetchInviteData]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 text-text p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-primary mb-8 drop-shadow-lg">
            {t('profile.title')}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar with avatar and user info */}
            <div className="space-y-8">
              <div className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border/30 p-8 shadow-xl">
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
                      <span className="font-medium">{user?.username || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('profile.fields.email')}</span>
                      <span className="font-medium">{user?.email || ''}</span>
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
            <div className="md:col-span-2 space-y-8">
              {/* Detailed statistics */}
              <section className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border/30 p-8 shadow-xl">
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

              {/* Invitations Section */}
              <section className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border/30 p-8 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">{t('profile.invitations.title')}</h2>
                <div className="space-y-6">
                  {/* Invitation Statistics */}
                  <div className="text-center p-3 bg-surface-light rounded-lg">
                    {user?.role === 'ADMIN' ? (
                      <div>
                        <div className="text-lg font-semibold text-green-500">∞</div>
                        <div className="text-sm text-text-secondary">{t('profile.invitations.stats.unlimited')}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-semibold text-blue-500">{availableInvites}</div>
                        <div className="text-sm text-text-secondary">
                          {t('profile.invitations.stats.available')}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {t('profile.invitations.limits.maxPerUser', { count: maxInvitesPerUser })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create Invitation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t('profile.invitations.create.title')}</h3>
                      <button
                        onClick={createInvite}
                        disabled={inviteLoading || 
                                 (user?.role !== 'ADMIN' && availableInvites <= 0) ||
                                 (registrationMode === 'closed' && user?.role !== 'ADMIN') ||
                                 (registrationMode === 'open' && user?.role !== 'ADMIN')}
                        className="px-4 py-2 bg-primary text-background rounded hover:bg-primary-dark 
                                   transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {inviteLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t('profile.invitations.create.creating')}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>{t('profile.invitations.create.button')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Status indicator */}
                    {user?.role !== 'ADMIN' && (
                      <div className="text-sm">
                        {registrationMode === 'open' && (
                          <p className="text-orange-600 dark:text-orange-400">
                            {t('profile.invitations.status.inviteOnlyWarning')}
                          </p>
                        )}
                        {registrationMode === 'closed' && (
                          <p className="text-red-600 dark:text-red-400">
                            {t('profile.invitations.status.closedWarning')}
                          </p>
                        )}
                        {registrationMode === 'invite_only' && availableInvites <= 0 && (
                          <p className="text-red-600 dark:text-red-400">
                            {t('profile.invitations.status.noInvitesWarning')}
                          </p>
                        )}
                        {registrationMode === 'invite_only' && availableInvites > 0 && (
                          <p className="text-green-600 dark:text-green-400">
                            {t('profile.invitations.status.canCreate', { 
                              count: availableInvites, 
                              plural: availableInvites !== 1 ? 'es' : '' 
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Generated Invite Link */}
                    {inviteLink && (
                      <div className="space-y-2">
                        <label className="block text-sm text-text-secondary">
                          {t('profile.invitations.generated.title')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 p-2 bg-background border border-border rounded 
                                       text-text font-mono text-sm"
                          />
                          <button
                            onClick={copyInviteLink}
                            className="px-4 py-2 bg-primary text-background rounded hover:bg-primary-dark 
                                       transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span className="text-sm">{t('profile.invitations.generated.copyButton')}</span>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={inviteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
                                       transition-colors flex items-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>{t('profile.invitations.generated.openButton')}</span>
                          </a>
                          <button
                            onClick={() => {
                              setInviteCode('');
                              setInviteLink('');
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 
                                       transition-colors text-sm"
                          >
                            {t('profile.invitations.generated.clearButton')}
                          </button>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {t('profile.invitations.generated.expiryInfo')}
                        </p>
                      </div>
                    )}

                    {/* Registration Mode Info */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>{t('profile.invitations.registrationMode.title')}</strong> {
                          registrationMode === 'open' ? t('profile.invitations.registrationMode.open') :
                          registrationMode === 'invite_only' ? t('profile.invitations.registrationMode.inviteOnly') :
                          registrationMode === 'closed' ? t('profile.invitations.registrationMode.closed') : 
                          t('profile.invitations.registrationMode.unknown')
                        }
                      </p>
                      {registrationMode === 'invite_only' && user?.role !== 'ADMIN' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {t('profile.invitations.registrationMode.inviteOnlyUser')}
                        </p>
                      )}
                      {registrationMode === 'invite_only' && user?.role === 'ADMIN' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {t('profile.invitations.registrationMode.inviteOnlyAdmin')}
                        </p>
                      )}
                      {registrationMode === 'closed' && user?.role === 'ADMIN' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {t('profile.invitations.registrationMode.closedAdmin')}
                        </p>
                      )}
                      {registrationMode === 'closed' && user?.role !== 'ADMIN' && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {t('profile.invitations.registrationMode.closedUser')}
                        </p>
                      )}
                      {registrationMode === 'open' && user?.role !== 'ADMIN' && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {t('profile.invitations.registrationMode.openUser')}
                        </p>
                      )}
                      {registrationMode === 'open' && user?.role === 'ADMIN' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {t('profile.invitations.registrationMode.openAdmin')}
                        </p>
                      )}
                    </div>

                    {/* Active Invitations */}
                    {activeInvites.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-text">{t('profile.invitations.active.title')}</h3>
                        <div className="space-y-3">
                          {activeInvites.map((invite) => {
                            const expiresAt = new Date(invite.expiresAt);
                            const isExpired = expiresAt < new Date();
                            const timeLeft = expiresAt.getTime() - new Date().getTime();
                            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                            const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

                            return (
                              <div key={invite.id} className="p-3 bg-surface-light rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                                      {invite.code}
                                    </span>
                                    {isExpired ? (
                                      <span className="text-xs text-red-500">{t('profile.invitations.active.expired')}</span>
                                    ) : (
                                      <span className="text-xs text-green-500">
                                        {t('profile.invitations.active.expiresIn', { hours: hoursLeft, minutes: minutesLeft })}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => cancelInvite(invite.id)}
                                    disabled={loadingInvites || isExpired}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 
                                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingInvites ? t('profile.invitations.active.canceling') : t('profile.invitations.active.cancelButton')}
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={invite.inviteLink}
                                    readOnly
                                    className="flex-1 p-2 bg-background border border-border rounded 
                                               text-text font-mono text-xs"
                                  />
                                  <button
                                    onClick={async () => {
                                      try {
                                        await navigator.clipboard.writeText(invite.inviteLink);
                                        showNotification.success(t('profile.invitations.active.copied'));
                                      } catch {
                                        showNotification.error(t('profile.invitations.active.copyError'));
                                      }
                                    }}
                                    className="px-3 py-2 bg-primary text-background rounded hover:bg-primary-dark 
                                               transition-colors text-xs"
                                  >
                                    {t('profile.invitations.active.copyButton')}
                                  </button>
                                </div>
                                <p className="text-xs text-text-secondary mt-1">
                                  {t('profile.invitations.active.createdOn', { 
                                    date: format(new Date(invite.createdAt), 'dd/MM/yyyy HH:mm') 
                                  })}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-text-secondary">
                          {t('profile.invitations.active.tip')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border/30 p-8 shadow-xl">
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