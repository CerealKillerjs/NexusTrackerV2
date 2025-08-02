'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import CommentsSection from '@/app/components/comments/CommentsSection';
import FileTree from '@/app/components/torrents/FileTree';
import { showNotification } from '@/app/utils/notifications';
// Icon imports
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { BookmarkMinus } from '@styled-icons/boxicons-regular/BookmarkMinus';
import { Like } from '@styled-icons/boxicons-regular/Like';
import { Dislike } from '@styled-icons/boxicons-regular/Dislike';
import { User } from '@styled-icons/boxicons-regular/User';
import { Calendar } from '@styled-icons/boxicons-regular/Calendar';
import { Folder } from '@styled-icons/boxicons-regular/Folder';
import { Tag } from '@styled-icons/boxicons-regular/Tag';
import { InfoCircle } from '@styled-icons/boxicons-regular/InfoCircle';
import { Copy } from '@styled-icons/boxicons-regular/Copy';
import { Magnet } from '@styled-icons/boxicons-regular/Magnet';
import Image from 'next/image';
import { Chat } from '@styled-icons/boxicons-regular/Chat';

interface TorrentData {
  id: string;
  name: string;
  description: string;
  type: string;
  source: string;
  size: number;
  files: Array<{
    path: string;
    size: number;
  }>;
  uploadedBy: string;
  downloads: number;
  createdAt: string;
  freeleech: boolean;
  tags: string[];
  anonymous: boolean;
  image?: string; // Base64 encoded image
  nfo?: string; // NFO file content

  user?: {
    username: string;
    ratio: number;
    uploaded: number;
    downloaded: number;
  };
  _count?: {
    comments?: number;
    bookmarks?: number;
    votes?: number;
  };
  userVote?: 'up' | 'down' | null;
  isBookmarked?: boolean;
}

interface ServerTranslations {
  // Header translations
  downloads: string;
  freeleech: string;
  
  // Torrent info translations
  torrentInfoTitle: string;
  size: string;
  type: string;
  source: string;
  files: string;
  tags: string;
  description: string;
  nfoFile: string;
  
  // File list translations
  fileListCount: string;
  
  // Comments translations
  commentsCount: string;
  addComment: string;
  
  // Actions translations
  actionsTitle: string;
  downloading: string;
  generating: string;
  magnet: string;
  addBookmark: string;
  removeBookmark: string;
  like: string;
  dislike: string;
  copyLink: string;
  
  // Uploader translations
  uploaderTitle: string;
  anonymous: string;
  user: string;
  ratio: string;
  uploaded: string;
  downloaded: string;
  
  // Statistics translations
  statisticsTitle: string;
  bookmarks: string;
  votes: string;
  comments: string;
  
  // Error translations
  errorTitle: string;
  notFound: string;
  loadError: string;
  fetchError: string;
  
  // Notification translations
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
}

interface TorrentDetailContentProps {
  torrentId: string;
  serverTranslations: ServerTranslations;
}

export default function TorrentDetailContent({ torrentId, serverTranslations }: TorrentDetailContentProps) {
  const { data: session } = useSession();
  const [torrent, setTorrent] = useState<TorrentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [generatingMagnet, setGeneratingMagnet] = useState(false);

  const fetchTorrentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/torrent/${torrentId}`);
      
      if (!response.ok) {
        throw new Error(serverTranslations.notFound);
      }

      const data = await response.json();
      setTorrent(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : serverTranslations.loadError;
      setError(errorMessage);
      showNotification.error(serverTranslations.fetchError);
    } finally {
      setLoading(false);
    }
  }, [torrentId, serverTranslations]);

  useEffect(() => {
    if (torrentId) {
      fetchTorrentData();
    }
  }, [torrentId, fetchTorrentData]);

  useEffect(() => {
    if (session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
      window.location.href = '/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || '');
    }
  }, [session]);

  const handleDownload = async () => {
    if (!session) {
      showNotification.error(serverTranslations.loginRequiredDownload);
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(`/api/torrent/${torrentId}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(serverTranslations.errorDownload);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${torrent?.name}.torrent`; // fallback
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

      showNotification.success(serverTranslations.successDownload);
    } catch (error) {
      console.error('Download error:', error);
      showNotification.error(serverTranslations.errorDownload);
    } finally {
      setDownloading(false);
    }
  };

  const handleMagnet = async () => {
    if (!session) {
      showNotification.error(serverTranslations.loginRequiredDownload);
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
      showNotification.error(serverTranslations.loginRequiredBookmark);
      return;
    }

    try {
      const response = await fetch(`/api/torrent/${torrentId}/bookmark`, {
        method: torrent?.isBookmarked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(serverTranslations.errorBookmark);
      }

      setTorrent(prev => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked,
        _count: {
          ...prev._count,
          bookmarks: prev.isBookmarked 
            ? (prev._count?.bookmarks || 1) - 1 
            : (prev._count?.bookmarks || 0) + 1
        }
      } : null);

      showNotification.success(
        torrent?.isBookmarked 
          ? serverTranslations.successBookmarkRemoved
          : serverTranslations.successBookmarkAdded
      );
    } catch (error) {
      console.error('Bookmark error:', error);
      showNotification.error(serverTranslations.errorBookmark);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!session) {
      showNotification.error(serverTranslations.loginRequiredVote);
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
        throw new Error(serverTranslations.errorVote);
      }

      setTorrent(prev => prev ? {
        ...prev,
        userVote: prev.userVote === voteType ? null : voteType
      } : null);

      showNotification.success(serverTranslations.successVote);
    } catch (error) {
      console.error('Vote error:', error);
      showNotification.error(serverTranslations.errorVote);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="w-3/4 h-8 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Torrent Information Skeleton */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              
              {/* Image Skeleton */}
              <div className="mb-6">
                <div className="w-96 h-96 bg-text-secondary/10 rounded-lg animate-pulse mx-auto"></div>
              </div>
              
              {/* Info Grid Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse mb-1"></div>
                    <div className="w-20 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Tags Skeleton */}
              <div className="mb-6">
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-16 h-6 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Description Skeleton */}
              <div>
                <div className="w-32 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* File List Skeleton */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section Skeleton */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                <div className="w-32 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-border pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-text-secondary/10 rounded-full animate-pulse"></div>
                      <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Action Buttons Skeleton */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="flex-1 h-12 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="flex-1 h-12 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-12 bg-text-secondary/10 rounded animate-pulse"></div>
                <div className="flex space-x-2">
                  <div className="flex-1 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="flex-1 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-10 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Uploader Information Skeleton */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse mb-1"></div>
                    <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-20 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-24 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Skeleton */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !torrent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <InfoCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">{serverTranslations.errorTitle}</h1>
          <p className="text-text-secondary">
            {error || serverTranslations.loadError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">{torrent.name}</h1>
        <div className="flex items-center space-x-4 text-text-secondary">
          <span className="flex items-center">
            <Calendar size={16} className="mr-1" />
            {formatDate(torrent.createdAt)}
          </span>
          <span className="flex items-center">
            <Download size={16} className="mr-1" />
            {torrent.downloads} {serverTranslations.downloads}
          </span>
          {torrent.freeleech && (
            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-sm">
              {serverTranslations.freeleech}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Torrent Information */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <InfoCircle size={20} className="mr-2" />
              {serverTranslations.torrentInfoTitle}
            </h2>
            
            {/* Torrent Image */}
            {torrent.image && (
              <div className="mb-6">
                <div className="flex justify-center">
                  <Image
                    src={`data:image/jpeg;base64,${torrent.image}`}
                    alt="Torrent preview"
                    width={384}
                    height={384}
                    className="max-w-full max-h-96 rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <span className="text-text-secondary block text-sm">{serverTranslations.size}</span>
                <span className="text-text font-medium">{formatFileSize(torrent.size)}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-sm">{serverTranslations.type}</span>
                <span className="text-text font-medium">{torrent.type || 'N/A'}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-sm">{serverTranslations.source}</span>
                <span className="text-text font-medium">{torrent.source || 'N/A'}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-sm">{serverTranslations.files}</span>
                <span className="text-text font-medium">{torrent.files.length}</span>
              </div>
            </div>

            {/* Tags */}
            {torrent.tags.length > 0 && (
              <div className="mb-6">
                <span className="text-text-secondary block text-sm mb-2 flex items-center">
                  <Tag size={16} className="mr-1" />
                  {serverTranslations.tags}
                </span>
                <div className="flex flex-wrap gap-2">
                  {torrent.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {torrent.description && (
              <div>
                <h3 className="text-lg font-medium text-text mb-2">{serverTranslations.description}</h3>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {torrent.description}
                </p>
              </div>
            )}

            {/* NFO File */}
            {torrent.nfo && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-text mb-2">{serverTranslations.nfoFile}</h3>
                <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-text-secondary text-sm whitespace-pre-wrap font-mono">
                    {torrent.nfo}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* File List */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <Folder size={20} className="mr-2" />
              {serverTranslations.fileListCount.replace('{{count}}', torrent.files.length.toString())}
            </h2>
            
            <FileTree files={torrent.files} />
          </div>

          {/* Comments Section */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text flex items-center">
                <Chat size={20} className="mr-2" />
                {serverTranslations.commentsCount.replace('{{count}}', (torrent._count?.comments || 0).toString())}
              </h2>
              
              {session && (
                <button
                  onClick={() => {
                    // Trigger modal opening event for CommentsSection
                    const event = new CustomEvent('openCommentModal');
                    window.dispatchEvent(event);
                  }}
                  className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                >
                  <span>{serverTranslations.addComment}</span>
                </button>
              )}
            </div>
            
            <CommentsSection torrentId={torrentId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-4">{serverTranslations.actionsTitle}</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 bg-primary text-background py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>{downloading ? serverTranslations.downloading : 'Torrent'}</span>
                </button>

                <button
                  onClick={handleMagnet}
                  disabled={generatingMagnet}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  title={generatingMagnet ? serverTranslations.generating : serverTranslations.magnet}
                >
                  <Magnet size={20} />
                  <span>Magnet</span>
                </button>
              </div>

              <button
                onClick={handleBookmark}
                className="w-full bg-surface-light border border-border text-text py-3 px-4 rounded-lg hover:bg-surface transition-colors flex items-center justify-center space-x-2"
              >
                {torrent.isBookmarked ? (
                  <>
                    <BookmarkMinus size={20} />
                    <span>{serverTranslations.removeBookmark}</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={20} />
                    <span>{serverTranslations.addBookmark}</span>
                  </>
                )}
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleVote('up')}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-colors flex items-center justify-center space-x-1 ${
                    torrent.userVote === 'up'
                      ? 'bg-green-500/10 border-green-500/20 text-green-500'
                      : 'bg-surface-light border-border text-text hover:bg-surface'
                  }`}
                >
                  <Like size={16} />
                  <span>{serverTranslations.like}</span>
                </button>
                <button
                  onClick={() => handleVote('down')}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-colors flex items-center justify-center space-x-1 ${
                    torrent.userVote === 'down'
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : 'bg-surface-light border-border text-text hover:bg-surface'
                  }`}
                >
                  <Dislike size={16} />
                  <span>{serverTranslations.dislike}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showNotification.success(serverTranslations.successLinkCopied);
                }}
                className="w-full bg-surface-light border border-border text-text py-2 px-4 rounded-lg hover:bg-surface transition-colors flex items-center justify-center space-x-2"
              >
                <Copy size={16} />
                <span>{serverTranslations.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Uploader Information */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
              <User size={20} className="mr-2" />
              {serverTranslations.uploaderTitle}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-text font-medium">
                    {torrent.anonymous ? serverTranslations.anonymous : torrent.user?.username || serverTranslations.user}
                  </p>
                  {!torrent.anonymous && torrent.user && (
                    <p className="text-text-secondary text-sm">
                      {serverTranslations.ratio.replace('{{ratio}}', torrent.user.ratio.toFixed(2))}
                    </p>
                  )}
                </div>
              </div>

              {!torrent.anonymous && torrent.user && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{serverTranslations.uploaded}</span>
                    <span className="text-text">{formatFileSize(torrent.user.uploaded)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{serverTranslations.downloaded}</span>
                    <span className="text-text">{formatFileSize(torrent.user.downloaded)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text mb-4">{serverTranslations.statisticsTitle}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">{serverTranslations.bookmarks}</span>
                <span className="text-text">{torrent._count?.bookmarks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{serverTranslations.votes}</span>
                <span className="text-text">{torrent._count?.votes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{serverTranslations.comments}</span>
                <span className="text-text">{torrent._count?.comments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 