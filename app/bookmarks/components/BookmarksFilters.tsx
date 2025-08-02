/**
 * BookmarksFilters Component - Search and filter controls
 * Handles category filtering, sorting, and search functionality
 */

import { useI18n } from '@/app/hooks/useI18n';
import { SelectField } from '@/app/components/ui/FigmaFloatingLabelSelect';
import { FormField } from '@/app/components/ui/FigmaFloatingLabelInput';

interface BookmarksFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  category: string;
  sortOrder: 'desc' | 'asc';
  categories: string[];
  onSearchSubmit: (e: React.FormEvent) => void;
  onCategoryChange: (category: string) => void;
  onSortOrderChange: (sortOrder: 'desc' | 'asc') => void;
  loading?: boolean;
}

export default function BookmarksFilters({
  search,
  setSearch,
  category,
  sortOrder,
  categories,
  onSearchSubmit,
  onCategoryChange,
  onSortOrderChange,
  loading = false
}: BookmarksFiltersProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
          {/* Category filter skeleton */}
          <div className="min-w-[180px] h-[45px] bg-text-secondary/10 rounded animate-pulse"></div>
          {/* Sort order skeleton */}
          <div className="min-w-[180px] h-[45px] bg-text-secondary/10 rounded animate-pulse"></div>
          {/* Search skeleton */}
          <div className="flex-1 flex items-center min-w-[200px]">
            <div className="flex-1 h-[45px] bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="ml-2 w-20 h-[45px] bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
        {/* Category filter */}
        <SelectField
          label={t('bookmarks.filter.category', 'Categoría')}
          value={category}
          onChange={onCategoryChange}
          options={[
            { value: 'all', label: t('bookmarks.filter.allCategories', 'Todas las categorías') },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          className="min-w-[180px]"
        />
        
        {/* Sort order */}
        <SelectField
          label={t('bookmarks.filter.order', 'Orden')}
          value={sortOrder}
          onChange={(val) => onSortOrderChange(val as 'desc' | 'asc')}
          options={[
            { value: 'desc', label: t('bookmarks.filter.newest', 'Más nuevo primero') },
            { value: 'asc', label: t('bookmarks.filter.oldest', 'Más antiguo primero') }
          ]}
          className="min-w-[180px]"
        />
        
        {/* Search bar */}
        <form onSubmit={onSearchSubmit} className="flex-1 flex items-center min-w-[200px]">
          <FormField
            label={t('bookmarks.filter.search', 'Buscar')}
            value={search}
            onChange={setSearch}
            placeholder={t('bookmarks.filter.searchPlaceholder', 'Buscar torrents...')}
            className="w-full"
          />
          <button 
            type="submit" 
            className="ml-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm h-[45px]"
          >
            {t('bookmarks.filter.search', 'Buscar')}
          </button>
        </form>
      </div>
    </div>
  );
} 