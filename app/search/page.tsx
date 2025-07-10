/**
 * Search Results Page
 * 
 * Displays search results for torrents in a format similar to ThePirateBay
 * Shows torrents with details like size, uploader, date, downloads, etc.
 * Includes filtering and sorting options
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Icon imports
import { Search } from '@styled-icons/boxicons-regular/Search';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { User } from '@styled-icons/boxicons-regular/User';
import { Calendar } from '@styled-icons/boxicons-regular/Calendar';
import { Tag } from '@styled-icons/boxicons-regular/Tag';
import { ListUl } from '@styled-icons/boxicons-regular/ListUl';

interface Torrent {
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
}

interface TorrentResponse {
  torrents: Torrent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Movies', label: 'Movies' },
    { value: 'TV', label: 'TV Shows' },
    { value: 'Music', label: 'Music' },
    { value: 'Books', label: 'Books' },
    { value: 'Games', label: 'Games' },
    { value: 'Software', label: 'Software' },
    { value: 'Other', label: 'Other' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'Size' },
    { value: 'downloads', label: 'Downloads' },
  ];

  // Fetch torrents
  const fetchTorrents = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (category && category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`/api/torrent/public?${params}`);
      
      if (!response.ok) {
        throw new Error('Error fetching torrents');
      }

      const data: TorrentResponse = await response.json();
      setTorrents(data.torrents);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching torrents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (category !== 'all') params.append('category', category);
    if (sortBy !== 'createdAt') params.append('sortBy', sortBy);
    if (sortOrder !== 'desc') params.append('sortOrder', sortOrder);
    
    router.push(`/search?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Load torrents on mount and when params change
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    fetchTorrents(page);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 text-text">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-border/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight drop-shadow-lg">
            Nexus<span className="text-accent">Tracker</span>
          </Link>
          <div className="text-text-secondary text-lg font-medium">Search Results</div>
        </div>
      </header>
      {/* Search Section */}
      <div className="bg-surface/80 backdrop-blur-xl border-b border-border/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search torrents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/80 border border-border/30 rounded-full text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-md transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary/90 text-background rounded-full hover:bg-primary transition-colors font-semibold shadow-lg text-base"
              >
                Search
              </button>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 bg-background/80 border border-border/30 rounded-full text-text focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-background/80 border border-border/30 rounded-full text-text focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 bg-background/80 border border-border/30 rounded-full text-text hover:bg-surface-light transition-colors shadow-md"
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading torrents...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Latest Torrents'}
              </h2>
              <div className="text-text-secondary">
                {pagination.total} torrents found
              </div>
            </div>

            {/* Torrents List */}
            {torrents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-secondary text-lg mb-2">No torrents found</div>
                <div className="text-text-secondary">Try adjusting your search criteria</div>
              </div>
            ) : (
              <div className="space-y-4">
                {torrents.map((torrent) => (
                  <div
                    key={torrent.id}
                    className="bg-surface border border-border rounded-lg p-4 hover:bg-surface-light transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link
                            href={`/torrents/public/${torrent.id}`}
                            className="text-primary hover:text-accent transition-colors font-medium text-lg"
                          >
                            {torrent.title}
                          </Link>
                          {torrent.freeleech && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Freeleech
                            </span>
                          )}
                        </div>
                        
                        <div className="text-text-secondary text-sm mb-2">
                          {torrent.description && torrent.description.length > 200
                            ? `${torrent.description.substring(0, 200)}...`
                            : torrent.description
                          }
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-text-secondary">
                          <span className="flex items-center">
                            <Download size={14} className="mr-1" />
                            {torrent.size}
                          </span>
                          <span className="flex items-center">
                            <User size={14} className="mr-1" />
                            {torrent.uploader}
                          </span>
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(torrent.uploadedAt)}
                          </span>
                          <span className="flex items-center">
                            <ListUl size={14} className="mr-1" />
                            {torrent.category}
                          </span>
                          <span>
                            {torrent.downloads} downloads
                          </span>
                          <span>
                            {torrent.comments} comments
                          </span>
                        </div>

                        {torrent.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Tag size={14} className="text-text-secondary" />
                            <div className="flex flex-wrap gap-1">
                              {torrent.tags.slice(0, 5).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                              {torrent.tags.length > 5 && (
                                <span className="text-text-secondary text-xs">
                                  +{torrent.tags.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-text hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-text-secondary">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-text hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 