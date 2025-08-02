/**
 * ProfileHeader Component - Page header with title
 * Displays the page title with proper spacing
 */

import { useI18n } from '@/app/hooks/useI18n';

export default function ProfileHeader() {
  const { t } = useI18n();

  return (
    <div className="pt-6 mb-6">
      <h1 className="text-3xl font-bold text-primary">
        {t('profile.title')}
      </h1>
    </div>
  );
} 