/**
 * BookmarksHeader Component - Page header with title and description
 * Displays the page title, description, and loading state
 */

import { useI18n } from '@/app/hooks/useI18n';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';

interface BookmarksHeaderProps {
  total: number;
  loading?: boolean;
}

export default function BookmarksHeader({ total, loading = false }: BookmarksHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="pt-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">
          <Bookmark className="inline mr-2 align-text-bottom" size={22} /> 
          {t('bookmarks.title')}
        </h1>
        <p className="text-text-secondary">
          {loading ? (
            <span className="inline-block w-48 h-5 bg-text-secondary/10 rounded animate-pulse"></span>
          ) : (
            t('bookmarks.description', { count: total })
          )}
        </p>
      </div>
    </div>
  );
} 