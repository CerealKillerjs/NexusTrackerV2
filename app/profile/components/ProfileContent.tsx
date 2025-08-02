/**
 * ProfileContent Component - Main content for profile page
 * Handles all profile logic, state management, and data fetching
 * Optimized with component-based architecture and skeleton loading
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useI18n } from '@/app/hooks/useI18n';
import { useLanguage } from '@/app/hooks/useLanguage';
import { showNotification } from '@/app/utils/notifications';
import { UserProfile } from '@/app/types/profile';

// Import components
import ProfileHeader from './ProfileHeader';
import ProfileSidebar from './ProfileSidebar';
import ProfileStats from './ProfileStats';
import ProfileInvitations from './ProfileInvitations';
import ProfilePreferences from './ProfilePreferences';
import RecentActivity from './RecentActivity';

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

export default function ProfileContent() {
  const { t } = useI18n();
  const { currentLanguage } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Invitation states
  const [inviteLink, setInviteLink] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [availableInvites, setAvailableInvites] = useState<number>(0);
  const [registrationMode, setRegistrationMode] = useState<string>('open');
  const [activeInvites, setActiveInvites] = useState<{ id: string; code: string; createdAt: string; used: boolean; expiresAt?: string; inviteLink?: string; }[]>([]);
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
    if (!announceUrl) {
      showNotification.error(t('profile.notification.noAnnounceUrl'));
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(announceUrl);
        showNotification.success(t('profile.notification.announceCopied'));
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = announceUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          showNotification.success(t('profile.notification.announceCopied'));
        } catch {
          showNotification.error(t('profile.notification.copyError'));
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error copying announce URL:', error);
      showNotification.error(t('profile.notification.copyError'));
    }
  }, [announceUrl, t]);

  // Format join date (using mock data for now)
  const formattedJoinDate = profile?.joinDate 
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
        const { inviteLink } = await response.json();
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

  // Show loading skeleton
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-text p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="pt-6 mb-6">
            <div className="w-48 h-8 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="space-y-4">
                  {/* Avatar Skeleton */}
                  <div className="w-full aspect-square rounded-lg bg-text-secondary/10 animate-pulse"></div>

                  {/* Avatar buttons skeleton */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-20 h-8 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>

                  {/* User Info skeleton */}
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                        <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="md:col-span-2 space-y-6">
              {/* Stats skeleton */}
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
                <div className="space-y-6">
                  {/* Announce URL skeleton */}
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-24 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Stats Grid skeleton */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
                      <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
                      <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invitations skeleton */}
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
                <div className="space-y-6">
                  {/* Stats skeleton */}
                  <div className="text-center p-3 bg-surface-light rounded-lg">
                    <div className="w-8 h-6 bg-text-secondary/10 rounded animate-pulse mx-auto mb-2"></div>
                    <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse mx-auto"></div>
                  </div>

                  {/* Create invitation skeleton */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-40 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-32 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Registration mode skeleton */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-64 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-48 h-3 bg-text-secondary/10 rounded animate-pulse mt-1"></div>
                  </div>
                </div>
              </div>

              {/* Preferences skeleton */}
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity skeleton */}
              <div className="bg-surface rounded-lg border border-border p-6">
                <div className="w-40 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-text-secondary/10 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-48 h-4 bg-text-secondary/10 rounded animate-pulse mb-1"></div>
                        <div className="w-32 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ProfileHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar with avatar and user info */}
          <ProfileSidebar
            user={user}
            profile={profile}
            previewUrl={previewUrl}
            fileInputRef={fileInputRef}
            formattedJoinDate={formattedJoinDate}
            onRemoveAvatar={handleRemoveAvatar}
            setPreviewUrl={setPreviewUrl}
            loading={!user}
          />

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Detailed statistics */}
            <ProfileStats
              announceUrl={announceUrl}
              profile={profile}
              onCopyAnnounceUrl={copyAnnounceUrl}
              loading={!user}
            />

            {/* Invitations Section */}
            <ProfileInvitations
              user={user}
              inviteLink={inviteLink}
              inviteLoading={inviteLoading}
              availableInvites={availableInvites}
              registrationMode={registrationMode}
              activeInvites={activeInvites}
              loadingInvites={loadingInvites}
              maxInvitesPerUser={maxInvitesPerUser}
              onCreateInvite={createInvite}
              onCopyInviteLink={copyInviteLink}
              onCancelInvite={cancelInvite}
              onClearInviteLink={() => setInviteLink('')}
            />

            {/* Preferences */}
            <ProfilePreferences
              profile={profile}
              setProfile={setProfile}
              loading={!user}
            />

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
} 