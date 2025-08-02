/**
 * BookmarksContent Component - Main content for bookmarks page
 * Handles all bookmarks logic, state management, and data fetching
 * Optimized with component-based architecture and skeleton loading
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/app/hooks/useI18n';
import { showNotification } from '@/app/utils/notifications';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';

// Import components
import BookmarksHeader from './BookmarksHeader';
import BookmarksFilters from './BookmarksFilters';
import BookmarksList from './BookmarksList';
import DeleteBookmarkModal from './DeleteBookmarkModal';

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

interface BookmarksResponse {
  bookmarks: Bookmark[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function BookmarksContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  
  // State management
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Get unique categories from current bookmarks
  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach(b => {
      if (b.torrent.category) set.add(b.torrent.category);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Fetch bookmarks from API
  const fetchBookmarks = useCallback(async (page = 1, opts?: { search?: string; category?: string; sortOrder?: 'desc' | 'asc' }) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: opts?.sortOrder || sortOrder,
      });
      if (opts?.search ?? search) params.append('search', opts?.search ?? search);
      if ((opts?.category ?? category) && (opts?.category ?? category) !== 'all') params.append('category', opts?.category ?? category);
      const response = await fetch(`/api/user/bookmarks?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los marcadores');
      }
      
      const data: BookmarksResponse = await response.json();
      setBookmarks(data.bookmarks);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [search, category, sortOrder]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Block access for unverified users
  useEffect(() => {
    if (status === 'authenticated' && session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
      router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    }
  }, [status, session, router]);

  // Fetch bookmarks when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookmarks();
    }
  }, [status, fetchBookmarks]);

  // Handle bookmark removal
  const handleRemoveBookmark = (bookmark: Bookmark) => {
    setBookmarkToDelete(bookmark);
    setShowDeleteModal(true);
  };

  // Confirm bookmark removal
  const confirmRemoveBookmark = async () => {
    if (!bookmarkToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/torrent/${bookmarkToDelete.torrent.id}/bookmark`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el marcador');
      }

      // Remove from local state
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkToDelete.id));
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));

      showNotification.success(t('bookmarks.notifications.removed'));
      setShowDeleteModal(false);
      setBookmarkToDelete(null);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showNotification.error(t('bookmarks.notifications.error'));
    } finally {
      setDeleting(false);
    }
  };

  // Cancel bookmark removal
  const cancelRemoveBookmark = () => {
    setShowDeleteModal(false);
    setBookmarkToDelete(null);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookmarks(1, { search });
  };

  // Handle filter changes
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    fetchBookmarks(1, { category: newCategory });
  };

  const handleSortOrderChange = (newSortOrder: 'desc' | 'asc') => {
    setSortOrder(newSortOrder);
    fetchBookmarks(1, { sortOrder: newSortOrder });
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="pt-6 mb-8">
          <div>
            <div className="w-64 h-8 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-48 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
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

        {/* Bookmarks List Skeleton */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-light flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse mr-2"></div>
              <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mr-2"></div>
              <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
            <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative bg-surface-light border border-border rounded-lg p-5 flex flex-col h-full justify-between min-h-[110px]">
                  {/* Remove button skeleton */}
                  <div className="absolute top-2 right-2 w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
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
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <BookmarksHeader 
        total={pagination.total}
        loading={loading}
      />

      {/* Filters */}
      <BookmarksFilters
        search={search}
        setSearch={setSearch}
        category={category}
        sortOrder={sortOrder}
        categories={categories}
        onSearchSubmit={handleSearchSubmit}
        onCategoryChange={handleCategoryChange}
        onSortOrderChange={handleSortOrderChange}
        loading={loading}
      />

      {/* Bookmarks List */}
      <BookmarksList
        bookmarks={bookmarks}
        loading={loading}
        error={error}
        pagination={pagination}
        onRemoveBookmark={handleRemoveBookmark}
        onRefresh={() => fetchBookmarks(pagination.page)}
        onPageChange={fetchBookmarks}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookmarkToDelete && (
        <DeleteBookmarkModal
          bookmark={bookmarkToDelete}
          deleting={deleting}
          onConfirm={confirmRemoveBookmark}
          onCancel={cancelRemoveBookmark}
        />
      )}
    </div>
  );
} 