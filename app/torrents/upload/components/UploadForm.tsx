/**
 * Upload Form Component
 * 
 * Handles the main form fields for torrent upload
 */

'use client';

import { useI18n } from '@/app/hooks/useI18n';
import { generateTagSuggestions } from '../utils/tagSuggestions';
import { Plus } from '@styled-icons/boxicons-regular/Plus';

// Categories and their sources
const CATEGORIES = {
  Movies: ['BluRay', 'WebDL', 'HDRip', 'DVDRip', 'BRRip', 'BDRip'],
  TV: ['BluRay', 'WebDL', 'HDRip', 'DVDRip', 'BRRip', 'BDRip'],
  Music: ['FLAC', 'MP3', 'AAC', 'OGG', 'WAV'],
  Books: ['PDF', 'EPUB', 'MOBI', 'AZW3', 'TXT'],
  Games: ['ISO', 'RAR', 'ZIP', 'EXE'],
  Software: ['ISO', 'RAR', 'ZIP', 'EXE', 'MSI'],
  Other: []
};

// Popular tags for quick selection
const POPULAR_TAGS = [
  'HD', '4K', 'HDR', 'DTS', 'AC3', 'AAC', 'FLAC', 'MP3',
  'BluRay', 'WebDL', 'HDRip', 'Complete', 'Season', 'Episode',
  'Documentary', 'Comedy', 'Drama', 'Action', 'Horror', 'Sci-Fi'
];

interface UploadFormProps {
  loading?: boolean;
  uploadedFile?: File | null;
  watchedCategory?: string;
  watchedTags?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  onAddCustomTag?: (tag: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
}

export default function UploadForm({ 
  loading = false, 
  uploadedFile, 
  watchedCategory,
  watchedTags = [],
  onAddTag,
  onRemoveTag,
  onAddCustomTag,
  register,
  errors
}: UploadFormProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Name skeleton */}
        <div>
          <div className="w-24 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
          <div className="w-full h-12 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
        
        {/* Category and Source skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="w-20 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="w-16 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Description skeleton */}
        <div>
          <div className="w-28 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
          <div className="w-full h-32 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Name */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-text mb-2">
            {t('upload.form.name.label')}
          </label>
          <input
            {...register?.('name')}
            type="text"
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder={t('upload.form.name.placeholder')}
          />
          {errors?.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            {t('upload.form.category.label')}
            {uploadedFile && watchedCategory && watchedCategory !== 'Other' && (
              <span className="ml-2 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                {t('upload.form.category.autoDetected')}
              </span>
            )}
          </label>
          <select 
            {...register?.('category')}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">{t('upload.form.category.placeholder')}</option>
            {Object.keys(CATEGORIES).map(category => (
              <option key={category} value={category}>
                {t(`upload.form.category.options.${category}`)}
              </option>
            ))}
          </select>
          {errors?.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            {t('upload.form.source.label')}
          </label>
          <select 
            {...register?.('source')}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors" 
            disabled={!watchedCategory}
          >
            <option value="">{t('upload.form.source.placeholder')}</option>
            {watchedCategory && CATEGORIES[watchedCategory as keyof typeof CATEGORIES]?.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          {errors?.source && (
            <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-text mb-2">
            {t('upload.form.description.label')}
          </label>
          <textarea
            {...register?.('description')}
            rows={6}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-vertical"
            placeholder={t('upload.form.description.placeholder')}
          />
          {errors?.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Tags Section - Integrated directly in the form */}
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-text mb-2">
          {t('upload.form.tags.label').replace('{{count}}', watchedTags.length.toString())}
        </label>
        
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {watchedTags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
            >
              {tag}
              {onRemoveTag && (
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-2 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Auto-suggested Tags */}
        {uploadedFile && watchedCategory && (
          <div className="mb-3">
            <p className="text-sm text-text-secondary mb-2">{t('upload.form.tags.suggestedTags')}</p>
            <div className="flex flex-wrap gap-2">
              {generateTagSuggestions(watchedCategory as 'Movies' | 'TV' | 'Music' | 'Books' | 'Games' | 'Software' | 'Other', uploadedFile.name)
                .filter(tag => !watchedTags.includes(tag))
                .slice(0, 8)
                .map((tag: string) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onAddTag?.(tag)}
                    disabled={watchedTags.length >= 10}
                    className="px-3 py-1 rounded-full text-sm bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        <div className="mb-3">
          <p className="text-sm text-text-secondary mb-2">{t('upload.form.tags.popularTags')}</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag: string) => (
              <button
                key={tag}
                type="button"
                onClick={() => onAddTag?.(tag)}
                disabled={watchedTags.includes(tag) || watchedTags.length >= 10}
                className="px-3 py-1 rounded-full text-sm bg-surface border border-border text-text hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Tag Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={t('upload.form.tags.placeholder')}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                onAddCustomTag?.(input.value);
                input.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              onAddCustomTag?.(input.value);
              input.value = '';
            }}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 