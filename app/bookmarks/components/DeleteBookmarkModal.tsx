/**
 * DeleteBookmarkModal Component - Confirmation modal for bookmark removal
 * Handles the confirmation dialog for deleting bookmarks
 */

import { useI18n } from '@/app/hooks/useI18n';
import { X } from '@styled-icons/boxicons-regular/X';
import { Trash } from '@styled-icons/boxicons-regular/Trash';
import { Refresh } from '@styled-icons/boxicons-regular/Refresh';

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

interface DeleteBookmarkModalProps {
  bookmark: Bookmark;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteBookmarkModal({
  bookmark,
  deleting,
  onConfirm,
  onCancel
}: DeleteBookmarkModalProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">
            {t('bookmarks.modal.title')}
          </h3>
          <button
            onClick={onCancel}
            className="text-text-secondary hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-text-secondary mb-6">
          {t('bookmarks.modal.message', { title: bookmark.torrent.title })}
        </p>
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-surface border border-border rounded hover:bg-surface-light transition-colors disabled:opacity-50"
          >
            {t('bookmarks.modal.cancel')}
          </button>
          <button
            onClick={onConfirm}
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
  );
} 