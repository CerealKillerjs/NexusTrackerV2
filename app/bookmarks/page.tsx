/**
 * Bookmarks Page - User's Bookmarked Torrents
 * Displays all torrents that the user has bookmarked
 * Features:
 * - List of bookmarked torrents with pagination
 * - Quick remove bookmark functionality with confirmation modal
 * - Consistent design with dashboard layout
 * - Internationalization support
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import { useI18n } from '@/app/hooks/useI18n';
import { showNotification } from '@/app/utils/notifications';
// Icon imports
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { File } from '@styled-icons/boxicons-regular/File';
import { ListUl } from '@styled-icons/boxicons-regular/ListUl';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { CaretUp } from '@styled-icons/boxicons-regular/CaretUp';
import { CaretDown } from '@styled-icons/boxicons-regular/CaretDown';
import { BarChartSquare } from '@styled-icons/boxicons-regular/BarChartSquare';
import { News } from '@styled-icons/boxicons-regular/News';
import { User } from '@styled-icons/boxicons-regular/User';
import { Chat } from '@styled-icons/boxicons-solid/Chat';
import { Refresh } from '@styled-icons/boxicons-regular/Refresh';
import { Trash } from '@styled-icons/boxicons-regular/Trash';
import { X } from '@styled-icons/boxicons-regular/X';
import { Check } from '@styled-icons/boxicons-regular/Check';
import { SelectField } from '@/app/components/ui/FigmaFloatingLabelSelect';
import { FormField } from '@/app/components/ui/FigmaFloatingLabelInput';

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

// Función para formatear bytes a tamaño legible
function formatBytes(bytes: string | number): string {
  let num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
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

  // Obtener categorías únicas de los marcadores actuales
  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach(b => {
      if (b.torrent.category) set.add(b.torrent.category);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Fetch bookmarks from API
  const fetchBookmarks = async (page = 1, opts?: { search?: string; category?: string; sortOrder?: 'desc' | 'asc' }) => {
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
  };

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
  }, [status]);

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

  // Handlers para filtros
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    fetchBookmarks(1, { category: e.target.value });
  };
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const order = e.target.value as 'desc' | 'asc';
    setSortOrder(order);
    fetchBookmarks(1, { sortOrder: order });
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookmarks(1, { search });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              <Bookmark className="inline mr-2 align-text-bottom" size={22} /> {t('bookmarks.title')}
            </h1>
            <p className="text-text-secondary">
              {t('bookmarks.description', { count: pagination.total })}
            </p>
          </div>
        </div>

        {/* Caja de filtros y búsqueda alineada con el grid */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
            {/* Filtro categoría */}
            <SelectField
              label={t('bookmarks.filter.category', 'Categoría')}
              value={category}
              onChange={val => { setCategory(val); fetchBookmarks(1, { category: val }); }}
              options={[
                { value: 'all', label: t('bookmarks.filter.allCategories', 'Todas las categorías') },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              className="min-w-[180px]"
            />
            {/* Orden */}
            <SelectField
              label={t('bookmarks.filter.order', 'Orden')}
              value={sortOrder}
              onChange={val => { setSortOrder(val as 'desc' | 'asc'); fetchBookmarks(1, { sortOrder: val as 'desc' | 'asc' }); }}
              options={[
                { value: 'desc', label: t('bookmarks.filter.newest', 'Más nuevo primero') },
                { value: 'asc', label: t('bookmarks.filter.oldest', 'Más antiguo primero') }
              ]}
              className="min-w-[180px]"
            />
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center min-w-[200px]">
              <FormField
                label={t('bookmarks.filter.search', 'Buscar')}
                value={search}
                onChange={setSearch}
                placeholder={t('bookmarks.filter.searchPlaceholder', 'Buscar torrents...')}
                className="w-full"
              />
              <button type="submit" className="ml-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm h-[45px]">
                {t('bookmarks.filter.search', 'Buscar')}
              </button>
            </form>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-light flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text flex items-center">
              <Bookmark className="mr-2" size={22} /> {t('bookmarks.list.title')}
              <span className="ml-2 text-sm text-text-secondary">
                {t('bookmarks.list.count', { count: bookmarks.length, total: pagination.total })}
              </span>
            </h2>
            <button
              onClick={() => fetchBookmarks(pagination.page)}
              disabled={loading}
              className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
            >
              <Refresh size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              {t('bookmarks.list.refresh')}
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-text-secondary">{t('bookmarks.list.loading')}</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">{t('bookmarks.list.error')}</div>
              <button
                onClick={() => fetchBookmarks(pagination.page)}
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
                    {/* Botón eliminar discreto */}
                    <button
                      onClick={() => handleRemoveBookmark(bookmark)}
                      className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1 rounded transition-colors"
                      title={t('bookmarks.actions.remove')}
                    >
                      <Trash size={16} />
                    </button>
                    {/* Título como enlace */}
                    <Link href={`/torrents/${bookmark.torrent.id}`} className="text-base font-semibold text-text hover:text-primary transition-colors mb-3 line-clamp-2">
                      {bookmark.torrent.title}
                    </Link>
                    {/* Fila compacta: categoría, tamaño, seeders, leechers */}
                    <div className="flex items-center gap-3 text-sm text-text-secondary w-full mt-auto">
                      <Link href={`/search?category=${encodeURIComponent(bookmark.torrent.category)}`} className="text-primary hover:underline whitespace-nowrap">
                        {bookmark.torrent.category}
                      </Link>
                      <span className="mx-1 text-text-secondary">•</span>
                      <span className="whitespace-nowrap">{formatBytes(bookmark.torrent.size)}</span>
                      <span className="ml-auto flex items-center gap-3">
                        <span className="text-green-500 flex items-center gap-1">{bookmark.torrent.seeders} <CaretUp size={14} /></span>
                        <span className="text-red-500 flex items-center gap-1">{bookmark.torrent.leechers} <CaretDown size={14} /></span>
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
                    onClick={() => fetchBookmarks(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('bookmarks.pagination.previous')}
                  </button>
                  <button
                    onClick={() => fetchBookmarks(pagination.page + 1)}
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookmarkToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">
                {t('bookmarks.modal.title')}
              </h3>
              <button
                onClick={cancelRemoveBookmark}
                className="text-text-secondary hover:text-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-text-secondary mb-6">
              {t('bookmarks.modal.message', { title: bookmarkToDelete.torrent.title })}
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={cancelRemoveBookmark}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-surface border border-border rounded hover:bg-surface-light transition-colors disabled:opacity-50"
              >
                {t('bookmarks.modal.cancel')}
              </button>
              <button
                onClick={confirmRemoveBookmark}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <Refresh size={16} className="mr-2 animate-spin" />
                    {t('bookmarks.modal.deleting')}
                  </>
                ) : (
                  <>
                    <Trash size={16} className="mr-2" />
                    {t('bookmarks.modal.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 