/**
 * Torrent Statistics Component
 * 
 * Displays torrent statistics:
 * - Bookmarks count
 * - Votes count
 * - Comments count
 * 
 * This component shows skeleton for numbers while loading
 */

'use client';

interface TorrentStatisticsProps {
  bookmarks: number;
  votes: number;
  comments: number;
  loading?: boolean;
  translations: {
    statisticsTitle: string;
    bookmarks: string;
    votes: string;
    comments: string;
  };
}

export default function TorrentStatistics({ 
  bookmarks, 
  votes, 
  comments, 
  loading = false,
  translations 
}: TorrentStatisticsProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">{translations.statisticsTitle}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-text-secondary">{translations.bookmarks}</span>
          {loading ? (
            <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text">{bookmarks}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{translations.votes}</span>
          {loading ? (
            <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text">{votes}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{translations.comments}</span>
          {loading ? (
            <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text">{comments}</span>
          )}
        </div>
      </div>
    </div>
  );
} 