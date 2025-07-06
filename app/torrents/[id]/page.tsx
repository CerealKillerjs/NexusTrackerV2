/**
 * Torrent Detail Page
 * 
 * Displays detailed information about a specific torrent including:
 * - Torrent information (name, description, size, etc.)
 * - Statistics (seeders, leechers, downloads)
 * - File list
 * - Comments section
 * - Action buttons (download, bookmark, vote)
 * - User information
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import { showNotification } from '@/app/utils/notifications';
// Icon imports
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { BookmarkMinus } from '@styled-icons/boxicons-regular/BookmarkMinus';
import { Like } from '@styled-icons/boxicons-regular/Like';
import { Dislike } from '@styled-icons/boxicons-regular/Dislike';
import { User } from '@styled-icons/boxicons-regular/User';
import { Calendar } from '@styled-icons/boxicons-regular/Calendar';
import { File } from '@styled-icons/boxicons-regular/File';
import { Folder } from '@styled-icons/boxicons-regular/Folder';
import { Tag } from '@styled-icons/boxicons-regular/Tag';
import { InfoCircle } from '@styled-icons/boxicons-regular/InfoCircle';
import { Comment } from '@styled-icons/boxicons-regular/Comment';
import { Copy } from '@styled-icons/boxicons-regular/Copy';

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

export default function TorrentDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [torrent, setTorrent] = useState<TorrentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const torrentId = params?.id as string;

  useEffect(() => {
    if (torrentId) {
      fetchTorrentData();
    }
  }, [torrentId]);

  const fetchTorrentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/torrent/${torrentId}`);
      
      if (!response.ok) {
        throw new Error('Torrent no encontrado');
      }

      const data = await response.json();
      setTorrent(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el torrent';
      setError(errorMessage);
      showNotification.error('Error al cargar el torrent');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!session) {
      showNotification.error('Debes iniciar sesión para descargar');
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(`/api/torrent/${torrentId}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al descargar el torrent');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${torrent?.name}.torrent`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification.success('Descarga iniciada');
    } catch (error) {
      console.error('Download error:', error);
      showNotification.error('Error al descargar el torrent');
    } finally {
      setDownloading(false);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      showNotification.error('Debes iniciar sesión para marcar');
      return;
    }

    try {
      const response = await fetch(`/api/torrent/${torrentId}/bookmark`, {
        method: torrent?.isBookmarked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar marcador');
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
        torrent?.isBookmarked ? 'Marcador eliminado' : 'Marcador agregado'
      );
    } catch (error) {
      console.error('Bookmark error:', error);
      showNotification.error('Error al actualizar marcador');
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!session) {
      showNotification.error('Debes iniciar sesión para votar');
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
        throw new Error('Error al votar');
      }

      setTorrent(prev => prev ? {
        ...prev,
        userVote: prev.userVote === voteType ? null : voteType
      } : null);

      showNotification.success('Voto registrado');
    } catch (error) {
      console.error('Vote error:', error);
      showNotification.error('Error al votar');
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-text">Cargando torrent...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !torrent) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <InfoCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
            <p className="text-text-secondary">
              {error || 'No se pudo cargar el torrent'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
              {torrent.downloads} descargas
            </span>
            {torrent.freeleech && (
              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-sm">
                Freeleech
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
                Información del Torrent
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <span className="text-text-secondary block text-sm">Tamaño</span>
                  <span className="text-text font-medium">{formatFileSize(torrent.size)}</span>
                </div>
                <div>
                  <span className="text-text-secondary block text-sm">Tipo</span>
                  <span className="text-text font-medium">{torrent.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-secondary block text-sm">Fuente</span>
                  <span className="text-text font-medium">{torrent.source || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-secondary block text-sm">Archivos</span>
                  <span className="text-text font-medium">{torrent.files.length}</span>
                </div>
              </div>

              {/* Tags */}
              {torrent.tags.length > 0 && (
                <div className="mb-6">
                  <span className="text-text-secondary block text-sm mb-2 flex items-center">
                    <Tag size={16} className="mr-1" />
                    Tags
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
                  <h3 className="text-lg font-medium text-text mb-2">Descripción</h3>
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {torrent.description}
                  </p>
                </div>
              )}

              {/* Image */}
              {torrent.image && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-text mb-2">Imagen</h3>
                  <div className="flex justify-center">
                    <img
                      src={`data:image/jpeg;base64,${torrent.image}`}
                      alt="Torrent preview"
                      className="max-w-full max-h-96 rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* NFO File */}
              {torrent.nfo && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-text mb-2">Archivo NFO</h3>
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
                Lista de Archivos ({torrent.files.length})
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {torrent.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background rounded border border-border"
                  >
                    <div className="flex items-center space-x-2">
                      <File size={16} className="text-text-secondary" />
                      <span className="text-text text-sm">{file.path}</span>
                    </div>
                    <span className="text-text-secondary text-sm">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                <Comment size={20} className="mr-2" />
                Comentarios ({torrent._count?.comments || 0})
              </h2>
              
              <div className="text-center py-8 text-text-secondary">
                <Comment size={48} className="mx-auto mb-4 opacity-50" />
                <p>Los comentarios estarán disponibles próximamente</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Acciones</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-primary text-background py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>{downloading ? 'Descargando...' : 'Descargar Torrent'}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className="w-full bg-surface-light border border-border text-text py-3 px-4 rounded-lg hover:bg-surface transition-colors flex items-center justify-center space-x-2"
                >
                  {torrent.isBookmarked ? (
                    <>
                      <BookmarkMinus size={20} />
                      <span>Quitar Marcador</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={20} />
                      <span>Agregar Marcador</span>
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
                    <span>Me gusta</span>
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
                    <span>No me gusta</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showNotification.success('Enlace copiado al portapapeles');
                  }}
                  className="w-full bg-surface-light border border-border text-text py-2 px-4 rounded-lg hover:bg-surface transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy size={16} />
                  <span>Copiar Enlace</span>
                </button>
              </div>
            </div>

            {/* Uploader Information */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Subido por
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-text font-medium">
                      {torrent.anonymous ? 'Anónimo' : torrent.user?.username || 'Usuario'}
                    </p>
                    {!torrent.anonymous && torrent.user && (
                      <p className="text-text-secondary text-sm">
                        Ratio: {torrent.user.ratio.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {!torrent.anonymous && torrent.user && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subido:</span>
                      <span className="text-text">{formatFileSize(torrent.user.uploaded)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Descargado:</span>
                      <span className="text-text">{formatFileSize(torrent.user.downloaded)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Estadísticas</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Marcadores:</span>
                  <span className="text-text">{torrent._count?.bookmarks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Votos:</span>
                  <span className="text-text">{torrent._count?.votes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Comentarios:</span>
                  <span className="text-text">{torrent._count?.comments || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 