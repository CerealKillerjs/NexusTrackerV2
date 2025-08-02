/**
 * Torrent Header Component
 * 
 * Displays basic torrent information:
 * - Torrent name
 * - Creation date
 * - Download count
 * - Freeleech status
 * 
 * This component loads immediately without skeleton as it uses basic data
 */

'use client';

import { Calendar } from '@styled-icons/boxicons-regular/Calendar';
import { Download } from '@styled-icons/boxicons-regular/Download';

interface TorrentHeaderProps {
  name: string;
  createdAt: string;
  downloads: number;
  freeleech: boolean;
  translations: {
    downloads: string;
    freeleech: string;
  };
}

export default function TorrentHeader({ 
  name, 
  createdAt, 
  downloads, 
  freeleech, 
  translations 
}: TorrentHeaderProps) {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-text mb-2">{name}</h1>
      <div className="flex items-center space-x-4 text-text-secondary">
        <span className="flex items-center">
          <Calendar size={16} className="mr-1" />
          {formatDate(createdAt)}
        </span>
        <span className="flex items-center">
          <Download size={16} className="mr-1" />
          {downloads} {translations.downloads}
        </span>
        {freeleech && (
          <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-sm">
            {translations.freeleech}
          </span>
        )}
      </div>
    </div>
  );
} 