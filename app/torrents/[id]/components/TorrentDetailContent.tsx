/**
 * Torrent Detail Content Component - Optimized Loading
 * 
 * Uses component-based architecture for better loading experience:
 * - TorrentHeader: Loads immediately (basic data)
 * - TorrentActions: Loads immediately (static UI)
 * - TorrentStatistics: Loads immediately (basic data)
 * - UploaderInfo: Loads with skeleton only for dynamic data
 * - TorrentInfo: Loads with skeleton only for dynamic data
 * - TorrentFiles: Loads immediately (basic data)
 * - CommentsSection: Loads with its own skeleton
 */

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import CommentsSection from './CommentsSection';
import TorrentHeader from './TorrentHeader';
import TorrentActions from './TorrentActions';
import UploaderInfo from './UploaderInfo';
import TorrentStatistics from './TorrentStatistics';
import TorrentInfo from './TorrentInfo';
import TorrentFiles from './TorrentFiles';
import { showNotification } from '@/app/utils/notifications';

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
    id: string;
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
  fileListSearch: string;
  
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
  
  // Use SWR for data fetching with caching
  const { 
    data: torrent, 
    error, 
    isLoading: loading,
    mutate: mutateTorrent 
  } = useSWR<TorrentData>(
    torrentId ? `/api/torrent/${torrentId}` : null,
    {
      // Disable revalidation on focus to prevent unnecessary requests
      revalidateOnFocus: false,
      // Disable revalidation on reconnect to maintain cache
      revalidateOnReconnect: false,
      // Deduplicate requests within 60 seconds
      dedupingInterval: 60000,
      // Error handling
      onError: (error) => {
        console.error('Torrent fetch error:', error);
      showNotification.error(serverTranslations.fetchError);
      },
    }
  );

  useEffect(() => {
    if (session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
      window.location.href = '/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || '');
    }
  }, [session]);

  const handleBookmarkChange = (isBookmarked: boolean) => {
    if (torrent) {
      mutateTorrent({
        ...torrent,
        isBookmarked,
        _count: {
          ...torrent._count,
          bookmarks: isBookmarked 
            ? (torrent._count?.bookmarks || 0) + 1 
            : (torrent._count?.bookmarks || 1) - 1
        }
      }, false); // false = don't revalidate
    }
  };

  const handleVoteChange = (vote: 'up' | 'down' | null) => {
    if (torrent) {
      mutateTorrent({
        ...torrent,
        userVote: vote
      }, false); // false = don't revalidate
    }
  };

  if (error || (!loading && !torrent)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
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
      {/* Header - With skeleton while loading */}
      {torrent ? (
        <TorrentHeader
          name={torrent.name}
          createdAt={torrent.createdAt}
          downloads={torrent.downloads}
          freeleech={torrent.freeleech}
          translations={{
            downloads: serverTranslations.downloads,
            freeleech: serverTranslations.freeleech,
          }}
        />
      ) : (
      <div className="mb-8">
          <div className="w-3/4 h-8 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="w-20 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Torrent Information - With skeleton for dynamic data */}
          <TorrentInfo
            image={torrent?.image}
            size={torrent?.size || 0}
            type={torrent?.type || ''}
            source={torrent?.source || ''}
            files={torrent?.files || []}
            tags={torrent?.tags || []}
            description={torrent?.description}
            nfo={torrent?.nfo}
            loading={loading}
            translations={{
              torrentInfoTitle: serverTranslations.torrentInfoTitle,
              size: serverTranslations.size,
              type: serverTranslations.type,
              source: serverTranslations.source,
              files: serverTranslations.files,
              tags: serverTranslations.tags,
              description: serverTranslations.description,
              nfoFile: serverTranslations.nfoFile,
            }}
          />

          {/* File List - With skeleton while loading */}
          <TorrentFiles
            files={torrent?.files || []}
            loading={loading}
            translations={{
              fileListCount: serverTranslations.fileListCount,
              fileListSearch: serverTranslations.fileListSearch,
            }}
          />

          {/* Comments Section - Loads with its own skeleton */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text">
                {loading ? (
                  <>
                    {serverTranslations.commentsCount.replace(' ({{count}})', '')}
                    <span className="text-text-secondary">(<div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse inline-block"></div>)</span>
                  </>
                ) : (
                  serverTranslations.commentsCount.replace('{{count}}', (torrent?._count?.comments || 0).toString())
                )}
              </h2>
              
              {session && (
                <button
                  onClick={() => {
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

        {/* Sidebar - Optimized loading order */}
        <div className="space-y-6">
          {/* Action Buttons - Always loads immediately (static UI) */}
          <TorrentActions
            torrentId={torrentId}
            isBookmarked={torrent?.isBookmarked || false}
            userVote={torrent?.userVote || null}
            translations={{
              actionsTitle: serverTranslations.actionsTitle,
              downloading: serverTranslations.downloading,
              generating: serverTranslations.generating,
              magnet: serverTranslations.magnet,
              addBookmark: serverTranslations.addBookmark,
              removeBookmark: serverTranslations.removeBookmark,
              like: serverTranslations.like,
              dislike: serverTranslations.dislike,
              copyLink: serverTranslations.copyLink,
              loginRequiredDownload: serverTranslations.loginRequiredDownload,
              loginRequiredBookmark: serverTranslations.loginRequiredBookmark,
              loginRequiredVote: serverTranslations.loginRequiredVote,
              errorDownload: serverTranslations.errorDownload,
              errorBookmark: serverTranslations.errorBookmark,
              errorVote: serverTranslations.errorVote,
              successDownload: serverTranslations.successDownload,
              successBookmarkAdded: serverTranslations.successBookmarkAdded,
              successBookmarkRemoved: serverTranslations.successBookmarkRemoved,
              successVote: serverTranslations.successVote,
              successLinkCopied: serverTranslations.successLinkCopied,
            }}
            onBookmarkChange={handleBookmarkChange}
            onVoteChange={handleVoteChange}
          />

          {/* Uploader Information - With skeleton for dynamic data */}
          <UploaderInfo
            anonymous={torrent?.anonymous || false}
            user={torrent?.user}
            loading={loading}
            translations={{
              uploaderTitle: serverTranslations.uploaderTitle,
              anonymous: serverTranslations.anonymous,
              user: serverTranslations.user,
              ratio: serverTranslations.ratio,
              uploaded: serverTranslations.uploaded,
              downloaded: serverTranslations.downloaded,
            }}
          />

          {/* Statistics - With skeleton for numbers while loading */}
          <TorrentStatistics
            bookmarks={torrent?._count?.bookmarks || 0}
            votes={torrent?._count?.votes || 0}
            comments={torrent?._count?.comments || 0}
            loading={loading}
            translations={{
              statisticsTitle: serverTranslations.statisticsTitle,
              bookmarks: serverTranslations.bookmarks,
              votes: serverTranslations.votes,
              comments: serverTranslations.comments,
            }}
          />
        </div>
      </div>
    </div>
  );
} 