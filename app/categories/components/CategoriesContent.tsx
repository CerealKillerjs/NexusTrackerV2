'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// Icon imports
import { Movie } from '@styled-icons/boxicons-regular/Movie';
import { Tv } from '@styled-icons/boxicons-regular/Tv';
import { Music } from '@styled-icons/boxicons-regular/Music';
import { Book } from '@styled-icons/boxicons-regular/Book';
import { Game } from '@styled-icons/boxicons-regular/Game';
import { Desktop } from '@styled-icons/boxicons-regular/Desktop';
import { Archive } from '@styled-icons/boxicons-regular/Archive';
import { RightArrow } from '@styled-icons/boxicons-regular/RightArrow';
import { ListUl } from '@styled-icons/boxicons-regular/ListUl';
import { Tag } from '@styled-icons/boxicons-regular/Tag';

interface TorrentData {
  id: string;
  name: string;
  size: string;
  downloads: number;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  count: number;
  recentTorrents: TorrentData[];
}

interface CategoryStats {
  [key: string]: {
    count: number;
    recentTorrents: TorrentData[];
  };
}

interface PopularTag {
  name: string;
  count: number;
  fontSize: number;
}

interface ServerTranslations {
  title: string;
  subtitle: string;
  browseAll: string;
  browseCategory: string;
  torrents: string;
  recentTorrents: string;
  statistics: string;
  movies: string;
  moviesDescription: string;
  tv: string;
  tvDescription: string;
  music: string;
  musicDescription: string;
  books: string;
  booksDescription: string;
  games: string;
  gamesDescription: string;
  software: string;
  softwareDescription: string;
  other: string;
  otherDescription: string;
  tagsTitle: string;
  tagsSubtitle: string;
  viewAll: string;
  noTags: string;
}

interface CategoriesContentProps {
  serverTranslations: ServerTranslations;
}

// Skeleton para el contenido dinámico
function CategoriesContentSkeleton({ serverTranslations }: { serverTranslations: ServerTranslations }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header - Siempre visible */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              <ListUl className="inline mr-2 align-text-bottom" size={22} /> {serverTranslations.title}
            </h1>
            <p className="text-text-secondary">
              {serverTranslations.subtitle}
            </p>
          </div>
          <Link 
            href="/search" 
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span>{serverTranslations.browseAll}</span>
            <RightArrow size={16} />
          </Link>
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-lg overflow-hidden">
            {/* Category Header Skeleton */}
            <div className="h-20 bg-text-secondary/10 flex items-center p-6">
              <div className="w-8 h-8 bg-white/20 rounded animate-pulse mr-3"></div>
              <div className="flex-1">
                <div className="w-24 h-5 bg-white/20 rounded animate-pulse mb-1"></div>
                <div className="w-16 h-3 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Category Content Skeleton */}
            <div className="p-6">
              {/* Description */}
              <div className="w-full h-3 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              
              {/* Recent Torrents List */}
              <div className="space-y-3 mb-4">
                <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="w-full h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="flex justify-between">
                      <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-12 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Explore Button */}
              <div className="w-full h-10 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Tags Section Skeleton */}
      <div className="mt-12 bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text flex items-center">
              <Tag className="mr-2" size={22} /> {serverTranslations.tagsTitle}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {serverTranslations.tagsSubtitle}
            </p>
          </div>
          <Link
            href="/search"
            className="flex items-center space-x-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-surface transition-colors text-sm font-medium"
          >
            <span>{serverTranslations.viewAll}</span>
            <RightArrow size={14} />
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="w-20 h-8 bg-text-secondary/10 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Statistics Section Skeleton */}
      <div className="mt-12 bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{serverTranslations.statistics}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-8 bg-text-secondary/10 rounded animate-pulse mx-auto mb-2"></div>
              <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesContent({ serverTranslations }: CategoriesContentProps) {
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define categories with their metadata - memoized to prevent recreation
  const categories: Category[] = useMemo(() => [
    {
      id: 'Movies',
      name: 'Movies',
      label: serverTranslations.movies,
      description: serverTranslations.moviesDescription,
      icon: Movie,
      color: 'bg-red-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'TV',
      name: 'TV Shows',
      label: serverTranslations.tv,
      description: serverTranslations.tvDescription,
      icon: Tv,
      color: 'bg-blue-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Music',
      name: 'Music',
      label: serverTranslations.music,
      description: serverTranslations.musicDescription,
      icon: Music,
      color: 'bg-green-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Books',
      name: 'Books',
      label: serverTranslations.books,
      description: serverTranslations.booksDescription,
      icon: Book,
      color: 'bg-yellow-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Games',
      name: 'Games',
      label: serverTranslations.games,
      description: serverTranslations.gamesDescription,
      icon: Game,
      color: 'bg-purple-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Software',
      name: 'Software',
      label: serverTranslations.software,
      description: serverTranslations.softwareDescription,
      icon: Desktop,
      color: 'bg-indigo-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Other',
      name: 'Other',
      label: serverTranslations.other,
      description: serverTranslations.otherDescription,
      icon: Archive,
      color: 'bg-gray-500',
      count: 0,
      recentTorrents: [],
    },
  ], [serverTranslations]);

  // Fetch category statistics and popular tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category stats
        const statsPromises = categories.map(async (category) => {
          const response = await fetch(`/api/torrent?category=${category.id}&limit=5&sortBy=createdAt&sortOrder=desc`);
          if (response.ok) {
            const data = await response.json();
            return {
              categoryId: category.id,
              count: data.pagination.total,
              recentTorrents: data.torrents.slice(0, 3).map((torrent: { id: string; title: string; size: string; downloads: number; uploadedAt: string }) => ({
                id: torrent.id,
                name: torrent.title,
                size: torrent.size,
                downloads: torrent.downloads,
                createdAt: torrent.uploadedAt,
              })),
            };
          }
          return {
            categoryId: category.id,
            count: 0,
            recentTorrents: [],
          };
        });

        // Fetch popular tags
        const tagsResponse = await fetch('/api/torrent/tags/popular?limit=30');
        let tags: PopularTag[] = [];
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          tags = tagsData.tags;
        }

        const results = await Promise.all(statsPromises);
        const stats: CategoryStats = {};
        
        results.forEach((result) => {
          stats[result.categoryId] = {
            count: result.count,
            recentTorrents: result.recentTorrents,
          };
        });

        setCategoryStats(stats);
        setPopularTags(tags);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categories]);

  // Format file size
  const formatSize = (bytes: string): string => {
    const size = parseInt(bytes);
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Mostrar skeleton mientras se cargan los datos dinámicos
  if (loading) {
    return <CategoriesContentSkeleton serverTranslations={serverTranslations} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              <ListUl className="inline mr-2 align-text-bottom" size={22} /> {serverTranslations.title}
            </h1>
            <p className="text-text-secondary">
              {serverTranslations.subtitle}
            </p>
          </div>
          <Link 
            href="/search" 
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span>{serverTranslations.browseAll}</span>
            <RightArrow size={16} />
          </Link>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = categoryStats[category.id] || { count: 0, recentTorrents: [] };
          const IconComponent = category.icon;
          
          return (
            <div 
              key={category.id}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Category Header */}
              <div className={`${category.color} p-6 text-white`}>
                <div className="flex items-center space-x-3">
                  <IconComponent size={32} />
                  <div>
                    <h2 className="text-xl font-semibold">{category.label}</h2>
                    <p className="text-sm opacity-90">{stats.count} {serverTranslations.torrents}</p>
                  </div>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                <p className="text-text-secondary text-sm mb-4">
                  {category.description}
                </p>

                {/* Recent Torrents */}
                {stats.recentTorrents.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h3 className="text-sm font-medium text-text">
                      {serverTranslations.recentTorrents}
                    </h3>
                    {stats.recentTorrents.map((torrent) => (
                      <div key={torrent.id} className="text-sm">
                        <Link 
                          href={`/torrents/${torrent.id}`}
                          className="text-primary hover:text-primary-dark transition-colors line-clamp-1"
                        >
                          {torrent.name}
                        </Link>
                        <div className="flex justify-between text-text-secondary text-xs mt-1">
                          <span>{formatSize(torrent.size)}</span>
                          <span>{formatDate(torrent.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Browse Button */}
                <Link
                  href={`/search?category=${category.id}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-surface transition-colors text-sm font-medium"
                >
                  <span>{serverTranslations.browseCategory}</span>
                  <RightArrow size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Tags Section */}
      <div className="mt-12 bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text flex items-center">
              <Tag className="mr-2" size={22} /> {serverTranslations.tagsTitle}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {serverTranslations.tagsSubtitle}
            </p>
          </div>
          <Link
            href="/search"
            className="flex items-center space-x-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-surface transition-colors text-sm font-medium"
          >
            <span>{serverTranslations.viewAll}</span>
            <RightArrow size={14} />
          </Link>
        </div>
        
        {popularTags.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {popularTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/search?q=${encodeURIComponent(tag.name)}`}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                style={{ fontSize: `${tag.fontSize}rem` }}
              >
                {tag.name}
                <span className="ml-2 text-xs opacity-70">({tag.count})</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">{serverTranslations.noTags}</p>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="mt-12 bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{serverTranslations.statistics}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const stats = categoryStats[category.id] || { count: 0, recentTorrents: [] };
            return (
              <div key={category.id} className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.count}</div>
                <div className="text-sm text-text-secondary">{category.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 