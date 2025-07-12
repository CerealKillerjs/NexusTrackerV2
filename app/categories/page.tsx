/**
 * Categories Page
 * 
 * Displays all available torrent categories with statistics
 * Shows category cards with torrent counts and popular items
 * Includes navigation to category-specific pages
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/app/hooks/useI18n';
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
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

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

export default function CategoriesPage() {
  const { t } = useI18n();
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define categories with their metadata
  const categories: Category[] = [
    {
      id: 'Movies',
      name: 'Movies',
      label: t('categories.movies'),
      description: t('categories.moviesDescription'),
      icon: Movie,
      color: 'bg-red-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'TV',
      name: 'TV Shows',
      label: t('categories.tv'),
      description: t('categories.tvDescription'),
      icon: Tv,
      color: 'bg-blue-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Music',
      name: 'Music',
      label: t('categories.music'),
      description: t('categories.musicDescription'),
      icon: Music,
      color: 'bg-green-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Books',
      name: 'Books',
      label: t('categories.books'),
      description: t('categories.booksDescription'),
      icon: Book,
      color: 'bg-yellow-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Games',
      name: 'Games',
      label: t('categories.games'),
      description: t('categories.gamesDescription'),
      icon: Game,
      color: 'bg-purple-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Software',
      name: 'Software',
      label: t('categories.software'),
      description: t('categories.softwareDescription'),
      icon: Desktop,
      color: 'bg-indigo-500',
      count: 0,
      recentTorrents: [],
    },
    {
      id: 'Other',
      name: 'Other',
      label: t('categories.other'),
      description: t('categories.otherDescription'),
      icon: Archive,
      color: 'bg-gray-500',
      count: 0,
      recentTorrents: [],
    },
  ];

  // Fetch category statistics and popular tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category stats
        const statsPromises = categories.map(async (category) => {
          const response = await fetch(`/api/torrent/public?category=${category.id}&limit=5&sortBy=createdAt&sortOrder=desc`);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background text-text">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text-secondary">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background text-text">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background text-text">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text mb-2">
                  <ListUl className="inline mr-2 align-text-bottom" size={22} /> {t('categories.title')}
                </h1>
                <p className="text-text-secondary">
                  {t('categories.subtitle')}
                </p>
              </div>
              <Link 
                href="/search" 
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
              >
                <span>{t('categories.browseAll')}</span>
                <RightArrow size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
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
                        <p className="text-sm opacity-90">{stats.count} {t('categories.torrents')}</p>
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
                          {t('categories.recentTorrents')}
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
                      <span>{t('categories.browseCategory')}</span>
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
                  <Tag className="mr-2" size={22} /> {t('tags.title')}
                </h2>
                <p className="text-text-secondary text-sm mt-1">
                  {t('tags.subtitle')}
                </p>
              </div>
              <Link
                href="/search"
                className="flex items-center space-x-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-surface transition-colors text-sm font-medium"
              >
                <span>{t('tags.viewAll')}</span>
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
                <p className="text-text-secondary">{t('tags.noTags')}</p>
              </div>
            )}
          </div>

          {/* Statistics Section */}
          <div className="mt-12 bg-surface border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('categories.statistics')}</h2>
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
      </div>
    </DashboardLayout>
  );
} 