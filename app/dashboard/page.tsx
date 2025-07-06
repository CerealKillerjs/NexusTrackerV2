/**
 * Dashboard Home Page - Hybrid Design
 * Combines modern design with professional torrent tracker features
 * - Authentication check with next-auth
 * - Professional table design with enhanced UX
 * - Responsive and accessible
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
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
import { Home } from '@styled-icons/boxicons-regular/Home';
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch torrents when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTorrents();
    }
  }, [status]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">Cargando...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              <Home className="inline mr-2 align-text-bottom" size={22} /> Panel Principal
            </h1>
            <p className="text-text-secondary">
              Bienvenido de vuelta, {session.user?.username || session.user?.email}
            </p>
          </div>
        </div>

        {/* Latest Torrents Section */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-light flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text flex items-center">
              <Download className="mr-2" size={22} /> Últimos Torrents
              <span className="ml-2 text-sm text-text-secondary">
                ({torrents.length} torrents)
              </span>
            </h2>
            <button
              onClick={fetchTorrents}
              disabled={loading}
              className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
            >
              <Refresh size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-text-secondary">Cargando torrents...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={fetchTorrents}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : torrents.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-text-secondary mb-2">No hay torrents para mostrar</div>
              <p className="text-sm text-text-secondary">
                Los torrents subidos aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-light border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <File className="inline mr-1 align-text-bottom" size={18} /> Título
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <ListUl className="inline mr-1 align-text-bottom" size={18} /> Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <Download className="inline mr-1 align-text-bottom" size={18} /> Tamaño
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <CaretUp className="inline mr-1 text-green-500 align-text-bottom" size={16} />/<CaretDown className="inline ml-1 text-red-500 align-text-bottom" size={16} /> S/L
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <BarChartSquare className="inline mr-1 align-text-bottom" size={18} /> Stats
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <News className="inline mr-1 align-text-bottom" size={18} /> Subido
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      <User className="inline mr-1 align-text-bottom" size={18} /> Subidor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {torrents.map((torrent) => (
                    <tr 
                      key={torrent.id} 
                      className="hover:bg-surface-light transition-colors duration-150"
                      onClick={() => window.location.href = `/torrents/${torrent.id}`} // Click anywhere on the row to go to the torrent page
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/torrents/${torrent.id}`}
                            className="text-text hover:text-primary transition-colors font-medium"
                          >
                            {torrent.title}
                          </a>
                          {torrent.freeleech && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              FL
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
                        <div className="flex items-center space-x-3 text-sm text-text-secondary">
                          <Download className="inline mr-1 align-text-bottom" size={14} title="Descargas" />{torrent.downloads}
                          <Chat className="inline mr-1 align-text-bottom" size={14} title="Comentarios" />{torrent.comments}
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
                        <a 
                          href={`/user/${torrent.uploader}`}
                          className="text-text-secondary hover:text-primary transition-colors flex items-center"
                        >
                          <User className="mr-1" size={14} />{torrent.uploader}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 