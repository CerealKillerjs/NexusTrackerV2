/**
 * BookmarksList Component - Displays bookmarks with pagination
 * Handles loading states, error states, and empty states
 */

import Link from 'next/link';
import { useI18n } from '@/app/hooks/useI18n';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { File } from '@styled-icons/boxicons-regular/File';
import { CaretUp } from '@styled-icons/boxicons-regular/CaretUp';
import { CaretDown } from '@styled-icons/boxicons-regular/CaretDown';
import { Refresh } from '@styled-icons/boxicons-regular/Refresh';
import { Trash } from '@styled-icons/boxicons-regular/Trash';

// Bookmark interface
interface Bookmark {
  id: string;
  createdAt: string;
  torrent: {
    id: string;
    title: string;
    category: string;
    size: string;
    seeders: number;
    leechers: number;
    uploadedAt: string;
    uploader: string;
    downloads: number;
    comments: number;
    freeleech: boolean;
    description: string;
    tags: string[];
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface BookmarksListProps {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  onRemoveBookmark: (bookmark: Bookmark) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

// Function to format bytes to readable size
function formatBytes(bytes: string | number): string {
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function BookmarksList({
  bookmarks,
  loading,
  error,
  pagination,
  onRemoveBookmark,
  onRefresh,
  onPageChange
}: BookmarksListProps) {
  const { t } = useI18n();

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-light flex justify-between items-center">
        <h2 className="text-xl font-semibold text-text flex items-center">
          <Bookmark className="mr-2" size={22} /> 
          {t('bookmarks.list.title')}
          <span className="ml-2 text-sm text-text-secondary">
            {loading ? (
              <span className="inline-block w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></span>
            ) : (
              t('bookmarks.list.count', { count: bookmarks.length, total: pagination.total })
            )}
          </span>
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Refresh size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          {t('bookmarks.list.refresh')}
        </button>
      </div>
      
      {loading ? (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative bg-surface-light border border-border rounded-lg p-5 flex flex-col h-full justify-between min-h-[110px]">
                {/* Title skeleton */}
                <div className="w-full h-5 bg-text-secondary/10 rounded animate-pulse mb-3"></div>
                {/* Category and stats skeleton */}
                <div className="flex items-center gap-3 text-sm w-full mt-auto">
                  <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">{t('bookmarks.list.error')}</div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            {t('bookmarks.list.retry')}
          </button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-text-secondary mb-2">{t('bookmarks.list.empty')}</div>
          <p className="text-sm text-text-secondary mb-4">
            {t('bookmarks.list.emptyDescription')}
          </p>
          <Link
            href="/torrents"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            <File className="mr-2" size={16} />
            {t('bookmarks.list.browseTorrents')}
          </Link>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="relative bg-surface-light border border-border rounded-lg p-5 flex flex-col h-full justify-between group transition hover:shadow-md min-h-[110px] font-[var(--font-geist-mono)]">
                {/* Remove button */}
                <button
                  onClick={() => onRemoveBookmark(bookmark)}
                  className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1 rounded transition-colors"
                  title={t('bookmarks.actions.remove')}
                >
                  <Trash size={16} />
                </button>
                
                {/* Title as link */}
                <Link href={`/torrents/${bookmark.torrent.id}`} className="text-base font-semibold text-text hover:text-primary transition-colors mb-3 line-clamp-2">
                  {bookmark.torrent.title}
                </Link>
                
                {/* Compact row: category, size, seeders, leechers */}
                <div className="flex items-center gap-3 text-sm text-text-secondary w-full mt-auto">
                  <Link href={`/search?category=${encodeURIComponent(bookmark.torrent.category)}`} className="text-primary hover:underline whitespace-nowrap">
                    {bookmark.torrent.category}
                  </Link>
                  <span className="mx-1 text-text-secondary">•</span>
                  <span className="whitespace-nowrap">{formatBytes(bookmark.torrent.size)}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="text-green-500 flex items-center gap-1">
                      {bookmark.torrent.seeders} <CaretUp size={14} />
                    </span>
                    <span className="text-red-500 flex items-center gap-1">
                      {bookmark.torrent.leechers} <CaretDown size={14} />
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border bg-surface-light">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {t('bookmarks.pagination.info', {
                page: pagination.page,
                totalPages: pagination.totalPages,
                total: pagination.total,
              })}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('bookmarks.pagination.previous')}
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('bookmarks.pagination.next')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 