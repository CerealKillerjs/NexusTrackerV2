/**
 * Dashboard Home Page - Hybrid Design
 * Combines modern design with professional torrent tracker features
 * - Authentication check with next-auth
 * - Professional table design with enhanced UX
 * - Responsive and accessible
 */

'use client';

import { useEffect } from 'react';
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

// Enhanced mock data for recent torrents
const recentTorrents = [
  {
    id: '1',
    title: 'Ubuntu 22.04 LTS Desktop',
    category: 'Applications',
    size: '3.2 GB',
    seeders: 150,
    leechers: 25,
    uploadedAt: '2024-01-15T10:30:00Z',
    uploader: 'LinuxMaster',
    downloads: 1250,
    comments: 45,
    freeleech: true
  },
  {
    id: '2',
    title: 'Debian 12 Bookworm',
    category: 'Applications',
    size: '2.8 GB',
    seeders: 120,
    leechers: 15,
    uploadedAt: '2024-01-14T15:45:00Z',
    uploader: 'DebianFan',
    downloads: 890,
    comments: 23,
    freeleech: false
  },
  {
    id: '3',
    title: 'Windows 11 Pro 23H2',
    category: 'Applications',
    size: '5.1 GB',
    seeders: 500,
    leechers: 75,
    uploadedAt: '2024-01-13T20:15:00Z',
    uploader: 'WindowsGuru',
    downloads: 2100,
    comments: 67,
    freeleech: true
  },
  {
    id: '4',
    title: 'Adobe Photoshop 2024',
    category: 'Applications',
    size: '2.1 GB',
    seeders: 85,
    leechers: 10,
    uploadedAt: '2024-01-12T12:00:00Z',
    uploader: 'DesignPro',
    downloads: 750,
    comments: 34,
    freeleech: false
  },
  {
    id: '5',
    title: 'Visual Studio Code 1.85',
    category: 'Applications',
    size: '180 MB',
    seeders: 200,
    leechers: 5,
    uploadedAt: '2024-01-11T09:20:00Z',
    uploader: 'CodeMaster',
    downloads: 3200,
    comments: 89,
    freeleech: true
  }
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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
          <div className="px-6 py-4 border-b border-border bg-surface-light">
            <h2 className="text-xl font-semibold text-text flex items-center">
              <Download className="mr-2" size={22} /> Últimos Torrents
              <span className="ml-2 text-sm text-text-secondary">
                ({recentTorrents.length} torrents)
              </span>
            </h2>
          </div>
          
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
                {recentTorrents.map((torrent) => (
                  <tr 
                    key={torrent.id} 
                    className="hover:bg-surface-light transition-colors duration-150"
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
        </div>
      </div>
    </DashboardLayout>
  );
} 