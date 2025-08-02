/**
 * Torrent Actions Component
 * 
 * Displays action buttons for torrent:
 * - Download torrent
 * - Generate magnet link
 * - Bookmark/Unbookmark
 * - Like/Dislike
 * - Copy link
 * 
 * This component loads immediately without skeleton as it's static UI
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { showNotification } from '@/app/utils/notifications';
// Icon imports
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { BookmarkMinus } from '@styled-icons/boxicons-regular/BookmarkMinus';
import { Like } from '@styled-icons/boxicons-regular/Like';
import { Dislike } from '@styled-icons/boxicons-regular/Dislike';
import { Copy } from '@styled-icons/boxicons-regular/Copy';
import { Magnet } from '@styled-icons/boxicons-regular/Magnet';

interface TorrentActionsProps {
  torrentId: string;
  isBookmarked: boolean;
  userVote: 'up' | 'down' | null;
  translations: {
    actionsTitle: string;
    downloading: string;
    generating: string;
    magnet: string;
    addBookmark: string;
    removeBookmark: string;
    like: string;
    dislike: string;
    copyLink: string;
    loginRequiredDownload: string;
    loginRequiredBookmark: string;
    loginRequiredVote: string;
    errorDownload: string;
    errorBookmark: string;
    errorVote: string;
    successDownload: string;
    successBookmarkAdded: string;
    successBookmarkRemoved: string;
    successVote: string;
    successLinkCopied: string;
  };
  onBookmarkChange: (isBookmarked: boolean) => void;
  onVoteChange: (vote: 'up' | 'down' | null) => void;
}

export default function TorrentActions({ 
  torrentId, 
  isBookmarked, 
  userVote, 
  translations,
  onBookmarkChange,
  onVoteChange
}: TorrentActionsProps) {
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState(false);
  const [generatingMagnet, setGeneratingMagnet] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleDownload = async () => {
    if (!session) {
      showNotification.error(translations.loginRequiredDownload);
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(`/api/torrent/${torrentId}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(translations.errorDownload);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `torrent.torrent`; // fallback
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification.success(translations.successDownload);
    } catch (error) {
      console.error('Download error:', error);
      showNotification.error(translations.errorDownload);
    } finally {
      setDownloading(false);
    }
  };

  const handleMagnet = async () => {
    if (!session) {
      showNotification.error(translations.loginRequiredDownload);
      return;
    }

    try {
      setGeneratingMagnet(true);
      const response = await fetch(`/api/torrent/${torrentId}/magnet`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error generating magnet link');
      }

      const data = await response.json();
      
      // Open magnet link in a new tab
      window.location.href = data.magnetLink;
    } catch (error) {
      console.error('Magnet generation error:', error);
      showNotification.error('Error generating magnet link');
    } finally {
      setGeneratingMagnet(false);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      showNotification.error(translations.loginRequiredBookmark);
      return;
    }

    try {
      const response = await fetch(`/api/torrent/${torrentId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(translations.errorBookmark);
      }

      onBookmarkChange(!isBookmarked);

      showNotification.success(
        isBookmarked 
          ? translations.successBookmarkRemoved
          : translations.successBookmarkAdded
      );
    } catch (error) {
      console.error('Bookmark error:', error);
      showNotification.error(translations.errorBookmark);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!session) {
      showNotification.error(translations.loginRequiredVote);
      return;
    }

    try {
      const response = await fetch(`/api/torrent/${torrentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: voteType }),
      });

      if (!response.ok) {
        throw new Error(translations.errorVote);
      }

      onVoteChange(userVote === voteType ? null : voteType);

      showNotification.success(translations.successVote);
    } catch (error) {
      console.error('Vote error:', error);
      showNotification.error(translations.errorVote);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">{translations.actionsTitle}</h3>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-primary text-background py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Download size={20} />
            <span>{downloading ? translations.downloading : 'Torrent'}</span>
          </button>

          <button
            onClick={handleMagnet}
            disabled={generatingMagnet}
            className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            title={generatingMagnet ? translations.generating : translations.magnet}
          >
            <Magnet size={20} />
            <span>Magnet</span>
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className="w-full bg-surface-light border border-border text-text py-3 px-4 rounded-lg hover:bg-surface transition-colors flex items-center justify-center space-x-2"
        >
          {isBookmarked ? (
            <>
              <BookmarkMinus size={20} />
              <span>{translations.removeBookmark}</span>
            </>
          ) : (
            <>
              <Bookmark size={20} />
              <span>{translations.addBookmark}</span>
            </>
          )}
        </button>

        <div className="flex space-x-2">
          <button
            onClick={() => handleVote('up')}
            className={`flex-1 py-2 px-3 rounded-lg border transition-colors flex items-center justify-center space-x-1 ${
              userVote === 'up'
                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                : 'bg-surface-light border-border text-text hover:bg-surface'
            }`}
          >
            <Like size={16} />
            <span>{translations.like}</span>
          </button>
          <button
            onClick={() => handleVote('down')}
            className={`flex-1 py-2 px-3 rounded-lg border transition-colors flex items-center justify-center space-x-1 ${
              userVote === 'down'
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-surface-light border-border text-text hover:bg-surface'
            }`}
          >
            <Dislike size={16} />
            <span>{translations.dislike}</span>
          </button>
        </div>

        <button
          onClick={async () => {
            try {
              // Set copied state for animation
              setLinkCopied(true);
              
              // Try modern clipboard API first
              if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(window.location.href);
                showNotification.success(translations.successLinkCopied);
              } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                  document.execCommand('copy');
                  showNotification.success(translations.successLinkCopied);
                } catch (err) {
                  console.error('Fallback copy failed:', err);
                  showNotification.error('Error copying link');
                } finally {
                  document.body.removeChild(textArea);
                }
              }
              
              // Reset animation after 2 seconds
              setTimeout(() => {
                setLinkCopied(false);
              }, 2000);
            } catch (error) {
              console.error('Copy failed:', error);
              showNotification.error('Error copying link');
              setLinkCopied(false);
            }
          }}
          className={`w-full border py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
            linkCopied
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : 'bg-surface-light border-border text-text hover:bg-surface'
          }`}
        >
          <Copy size={16} />
          <span>{translations.copyLink}</span>
        </button>
      </div>
    </div>
  );
} 