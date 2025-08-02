/**
 * ProfilePreferences Component - User preferences
 * Handles user preference toggles and settings
 */

import { useI18n } from '@/app/hooks/useI18n';
import { UserProfile } from '@/app/types/profile';

interface ProfilePreferencesProps {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  loading?: boolean;
}

export default function ProfilePreferences({
  profile,
  setProfile,
  loading = false
}: ProfilePreferencesProps) {
  const { t } = useI18n();

  return (
    <section className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">{t('profile.sections.preferences')}</h2>
      <div className="space-y-4">
        {/* Preferences toggles */}
        {loading ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!profile?.preferences?.notifications}
                onChange={(e) => {
                  if (profile) {
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, notifications: e.target.checked }
                    });
                  }
                }}
                className="h-4 w-4"
              />
              <span>{t('profile.fields.notifications')}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!profile?.preferences?.privateProfile}
                onChange={(e) => {
                  if (profile) {
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, privateProfile: e.target.checked }
                    });
                  }
                }}
                className="h-4 w-4"
              />
              <span>{t('profile.fields.privateProfile')}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
} 