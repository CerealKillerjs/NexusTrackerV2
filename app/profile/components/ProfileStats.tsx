/**
 * ProfileStats Component - Detailed user statistics
 * Displays announce URL, upload/download stats, and other user metrics
 */

import { useI18n } from '@/app/hooks/useI18n';
import { UserProfile } from '@/app/types/profile';

interface ProfileStatsProps {
  announceUrl: string;
  profile: UserProfile | null;
  onCopyAnnounceUrl: () => void;
  loading?: boolean;
}

export default function ProfileStats({
  announceUrl,
  profile,
  onCopyAnnounceUrl,
  loading = false
}: ProfileStatsProps) {
  const { t } = useI18n();

  return (
    <section className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">{t('profile.sections.stats')}</h2>
      <div className="space-y-6">
        {/* Announce URL */}
        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">
            {t('profile.fields.announceUrl')}
          </label>
          <div className="flex gap-2">
            {loading ? (
              <>
                <div className="flex-1 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
                <div className="w-24 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={announceUrl}
                  readOnly
                  className="flex-1 p-2 bg-background border border-border rounded 
                             text-text font-mono text-sm"
                />
                <button
                  onClick={onCopyAnnounceUrl}
                  className="px-4 py-2 bg-primary text-background rounded hover:bg-primary-dark 
                             transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span className="text-sm">{t('common.copy')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-sm text-text-secondary">
              {t('profile.fields.uploaded')}
            </span>
            {loading ? (
              <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
            ) : (
              <span className="text-lg font-medium text-green">{profile?.stats?.uploaded ?? '0 B'}</span>
            )}
          </div>
          <div>
            <span className="block text-sm text-text-secondary">
              {t('profile.fields.downloaded')}
            </span>
            {loading ? (
              <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
            ) : (
              <span className="text-lg font-medium text-primary">{profile?.stats?.downloaded ?? '0 B'}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 