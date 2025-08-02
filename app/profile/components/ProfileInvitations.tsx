/**
 * ProfileInvitations Component - Invitation management
 * Handles invitation creation, copying, and management
 */

import { format } from 'date-fns';
import { useI18n } from '@/app/hooks/useI18n';
import { showNotification } from '@/app/utils/notifications';

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

interface ProfileInvitationsProps {
  user?: SessionUser;
  inviteLink: string;
  inviteLoading: boolean;
  availableInvites: number;
  registrationMode: string;
  activeInvites: { id: string; code: string; createdAt: string; used: boolean; expiresAt?: string; inviteLink?: string; }[];
  loadingInvites: boolean;
  maxInvitesPerUser: number;
  onCreateInvite: () => void;
  onCopyInviteLink: () => void;
  onCancelInvite: (inviteId: string) => void;
  onClearInviteLink: () => void;
}

export default function ProfileInvitations({
  user,
  inviteLink,
  inviteLoading,
  availableInvites,
  registrationMode,
  activeInvites,
  loadingInvites,
  maxInvitesPerUser,
  onCreateInvite,
  onCopyInviteLink,
  onCancelInvite,
  onClearInviteLink
}: ProfileInvitationsProps) {
  const { t } = useI18n();

  return (
    <section className="bg-surface rounded-lg border border-border p-6">
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
              onClick={onCreateInvite}
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
                  onClick={onCopyInviteLink}
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
                  onClick={onClearInviteLink}
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
                  const expiresAt = new Date(invite.expiresAt || '');
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
                          onClick={() => onCancelInvite(invite.id)}
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
                          value={invite.inviteLink || ''}
                          readOnly
                          className="flex-1 p-2 bg-background border border-border rounded 
                                     text-text font-mono text-xs"
                        />
                        <button
                          onClick={async () => {
                            const inviteLink = invite.inviteLink || '';
                            if (!inviteLink) {
                              showNotification.error(t('profile.invitations.active.noLink'));
                              return;
                            }

                            try {
                              // Try modern clipboard API first
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(inviteLink);
                                showNotification.success(t('profile.invitations.active.copied'));
                              } else {
                                // Fallback for older browsers or non-secure contexts
                                const textArea = document.createElement('textarea');
                                textArea.value = inviteLink;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-999999px';
                                textArea.style.top = '-999999px';
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                
                                try {
                                  document.execCommand('copy');
                                  showNotification.success(t('profile.invitations.active.copied'));
                                } catch {
                                  showNotification.error(t('profile.invitations.active.copyError'));
                                }
                                
                                document.body.removeChild(textArea);
                              }
                            } catch (error) {
                              console.error('Error copying invite link:', error);
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
  );
} 