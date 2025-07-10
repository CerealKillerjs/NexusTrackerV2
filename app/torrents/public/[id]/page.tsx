/**
 * Public Torrent Details Page
 * 
 * Displays detailed information about a specific torrent for public users
 * No authentication required - used when PUBLIC_BROWSING_MODE is enabled
 * Shows torrent info, description, files, and download options
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
// Icon imports
import { Download } from '@styled-icons/boxicons-regular/Download';
import { User } from '@styled-icons/boxicons-regular/User';
import { Calendar } from '@styled-icons/boxicons-regular/Calendar';
import { ListUl } from '@styled-icons/boxicons-regular/ListUl';
import { Comment } from '@styled-icons/boxicons-regular/Comment';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { Share } from '@styled-icons/boxicons-regular/Share';
import { LogIn } from '@styled-icons/boxicons-regular/LogIn';
import { Plus } from '@styled-icons/boxicons-regular/Plus';
import { Magnet } from '@styled-icons/boxicons-regular/Magnet';
import FileTree from '@/app/components/torrents/FileTree';

interface TorrentDetails {
  id: string;
  name: string;
  description: string;
  type: string;
  size: number;
  downloads: number;
  createdAt: string;
  freeleech: boolean;
  tags: string[];
  anonymous: boolean;
  user: {
    username: string;
  };
  magnet: string;
  files: {
    path: string;
    size: number;
  }[];
  _count: {
    comments: number;
    bookmarks: number;
    votes: number;
  };
}

export default function PublicTorrentDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const torrentId = params.id as string;
  
  const [torrent, setTorrent] = useState<TorrentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Fetch torrent details
  const fetchTorrentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching torrent details for ID:', torrentId);
      const response = await fetch(`/api/torrent/public/${torrentId}`);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Torrent not found');
        }
        throw new Error('Error fetching torrent details');
      }

      const data = await response.json();
      console.log('Received data:', data);
      setTorrent(data);
    } catch (err) {
      console.error('Error fetching torrent details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle magnet download
  const handleMagnetDownload = () => {
    if (torrent?.magnet) {
      window.open(torrent.magnet, '_blank');
    }
  };

  // Handle torrent file download
  const handleTorrentDownload = async () => {
    if (!torrent) return;
    
    try {
      const response = await fetch(`/api/torrent/public/${torrentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${torrent.name}.torrent`; // fallback
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
      }
    } catch (error) {
      console.error('Error downloading torrent file:', error);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Load torrent details on mount
  useEffect(() => {
    if (torrentId) {
      fetchTorrentDetails();
    }
  }, [torrentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text text-lg">Loading torrent details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <Link 
            href="/"
            className="text-primary hover:text-accent transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!torrent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-text-secondary text-lg mb-4">Torrent not found</div>
          <Link 
            href="/"
            className="text-primary hover:text-accent transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center text-text hover:text-primary transition-colors"
              >
                ← Back to Search
              </Link>
              <div className="text-2xl font-bold text-primary">
                Nexus<span className="text-accent">Tracker</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin"
                className="flex items-center px-4 py-2 text-text hover:text-primary transition-colors"
              >
                <LogIn size={20} className="mr-2" />
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="flex items-center px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Torrent Header */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text mb-2">
                {torrent.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <span className="flex items-center">
                  <ListUl size={16} className="mr-1" />
                  {torrent.type || 'Uncategorized'}
                </span>
                <span className="flex items-center">
                  <Download size={16} className="mr-1" />
                  {formatBytes(torrent.size)}
                </span>
                <span className="flex items-center">
                  <User size={16} className="mr-1" />
                  {torrent.anonymous ? 'Anonymous' : torrent.user?.username || 'Unknown'}
                </span>
                <span className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {formatDate(torrent.createdAt)}
                </span>
                <span>
                  {torrent.downloads} downloads
                </span>
                <span className="flex items-center">
                  <Comment size={16} className="mr-1" />
                  {torrent._count.comments} comments
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {torrent.freeleech && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Freeleech
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTorrentDownload}
              className="flex items-center px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              <Download size={20} className="mr-2" />
              Download Torrent
            </button>
            <button
              onClick={handleMagnetDownload}
              className="flex items-center px-6 py-3 bg-red-500 text-background rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Magnet size={20} className="mr-2" />
              Magnet Link
            </button>
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-3 bg-surface border border-border rounded-lg text-text hover:bg-surface-light transition-colors"
            >
              <Share size={20} className="mr-2" />
              {shareCopied ? 'Copied!' : 'Share'}
            </button>
            {session && (
              <button className="flex items-center px-4 py-3 bg-surface border border-border rounded-lg text-text hover:bg-surface-light transition-colors">
                <Bookmark size={20} className="mr-2" />
                Bookmark
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-text">
                {torrent.description ? (
                  <div className="whitespace-pre-wrap">{torrent.description}</div>
                ) : (
                  <p className="text-text-secondary">No description available.</p>
                )}
              </div>
            </div>

            {/* Files */}
            {torrent.files && torrent.files.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Files ({torrent.files.length})</h2>
                <FileTree files={torrent.files} />
              </div>
            )}

            {/* Comments */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Comments ({torrent._count.comments})
              </h2>
              <div className="text-center py-8">
                <div className="text-text-secondary mb-4">
                  Comments are only available for registered users.
                </div>
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <LogIn size={20} className="mr-2" />
                  Login to Comment
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Torrent Info */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Torrent Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Type:</span>
                  <span className="text-text">{torrent.type || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Size:</span>
                  <span className="text-text">{formatBytes(torrent.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Uploaded:</span>
                  <span className="text-text">{formatDate(torrent.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Uploader:</span>
                  <span className="text-text">
                    {torrent.anonymous ? 'Anonymous' : torrent.user?.username || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Downloads:</span>
                  <span className="text-text">{torrent.downloads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Comments:</span>
                  <span className="text-text">{torrent._count.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Bookmarks:</span>
                  <span className="text-text">{torrent._count.bookmarks}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {torrent.tags && torrent.tags.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {torrent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Torrents */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Related Torrents</h3>
              <div className="text-center py-4">
                <div className="text-text-secondary mb-4">
                  Related torrents are only available for registered users.
                </div>
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  <LogIn size={16} className="mr-2" />
                  Login to View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 