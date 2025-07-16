'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import Link from 'next/link';

// Icon imports
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

// Torrent interface
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

export default function LatestTorrents() {
  const { t } = useI18n();
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch torrents from API
  const fetchTorrents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/torrent?limit=10&sortBy=createdAt&sortOrder=desc');
      
      if (!response.ok) {
        throw new Error('Error al cargar los torrents');
      }
      
      const data: TorrentResponse = await response.json();
      setTorrents(data.torrents);
    } catch (err) {
      console.error('Error fetching torrents:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Fetch torrents when component mounts
  useEffect(() => {
    fetchTorrents();
  }, []);

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-light flex justify-between items-center">
        <h2 className="text-xl font-semibold text-text flex items-center">
          <Download className="mr-2" size={22} /> {t('dashboard.latestTorrents.title')}
          <span className="ml-2 text-sm text-text-secondary">
            {t('dashboard.latestTorrents.count', { count: torrents.length })}
          </span>
        </h2>
        <button
          onClick={fetchTorrents}
          disabled={loading}
          className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Refresh size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          {t('dashboard.latestTorrents.refresh')}
        </button>
      </div>
      
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-light border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <File className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.title')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <ListUl className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.category')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <Download className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.size')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <CaretUp className="inline mr-1 text-green-500 align-text-bottom" size={16} />/<CaretDown className="inline ml-1 text-red-500 align-text-bottom" size={16} /> {t('dashboard.table.headers.seedersLeechers')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <BarChartSquare className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.stats')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <News className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.uploaded')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <User className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.uploader')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-surface-light transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-48 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-16 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-6 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">{t('dashboard.latestTorrents.error')}</div>
          <button
            onClick={fetchTorrents}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            {t('dashboard.latestTorrents.retry')}
          </button>
        </div>
      ) : torrents.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-text-secondary mb-2">{t('dashboard.latestTorrents.empty')}</div>
          <p className="text-sm text-text-secondary">
            {t('dashboard.latestTorrents.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-light border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <File className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.title')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <ListUl className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.category')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <Download className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.size')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <CaretUp className="inline mr-1 text-green-500 align-text-bottom" size={16} />/<CaretDown className="inline ml-1 text-red-500 align-text-bottom" size={16} /> {t('dashboard.table.headers.seedersLeechers')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <BarChartSquare className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.stats')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <News className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.uploaded')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                  <User className="inline mr-1 align-text-bottom" size={18} /> {t('dashboard.table.headers.uploader')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {torrents.map((torrent) => (
                <tr 
                  key={torrent.id} 
                  className="hover:bg-surface-light transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/torrents/${torrent.id}`}
                        className="text-text hover:text-primary transition-colors font-medium"
                      >
                        {torrent.title}
                      </Link>
                      {torrent.freeleech && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('dashboard.table.freeleech')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <ListUl className="mr-1" size={14} />{torrent.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary font-mono">
                    <Download className="inline mr-1 align-text-bottom" size={14} />{torrent.size}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 font-medium flex items-center">
                        <CaretUp size={14} className="mr-1" />{torrent.seeders}
                      </span>
                      <span className="text-text-secondary">/</span>
                      <span className="text-red-500 font-medium flex items-center">
                        <CaretDown size={14} className="mr-1" />{torrent.leechers}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <span className="flex items-center">
                        <Download className="mr-1 align-text-bottom" size={14} title={t('dashboard.table.stats.downloads')} />
                        {torrent.downloads}
                      </span>
                      <span className="flex items-center">
                        <Chat className="mr-1 align-text-bottom" size={14} title={t('dashboard.table.stats.comments')} />
                        {torrent.comments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    <News className="inline mr-1 align-text-bottom" size={14} />
                    {new Date(torrent.uploadedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/user/${torrent.uploader}`}
                      className="text-text-secondary hover:text-primary transition-colors flex items-center"
                    >
                      <User className="mr-1" size={14} />{torrent.uploader}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 