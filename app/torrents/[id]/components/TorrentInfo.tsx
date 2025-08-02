/**
 * Torrent Info Component
 * 
 * Displays detailed torrent information:
 * - Torrent image (skeleton)
 * - Basic info (size, type, source, files)
 * - Tags
 * - Description
 * - NFO file
 * 
 * This component shows static UI immediately and skeletons only for dynamic data
 */

'use client';

import Image from 'next/image';
import { InfoCircle } from '@styled-icons/boxicons-regular/InfoCircle';
import { Tag } from '@styled-icons/boxicons-regular/Tag';

interface TorrentInfoProps {
  image?: string;
  size: number;
  type: string;
  source: string;
  files: Array<{ path: string; size: number }>;
  tags: string[];
  description?: string;
  nfo?: string;
  loading?: boolean;
  translations: {
    torrentInfoTitle: string;
    size: string;
    type: string;
    source: string;
    files: string;
    tags: string;
    description: string;
    nfoFile: string;
  };
}

export default function TorrentInfo({ 
  image, 
  size, 
  type, 
  source, 
  files, 
  tags, 
  description, 
  nfo, 
  loading = false,
  translations 
}: TorrentInfoProps) {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
        <InfoCircle size={20} className="mr-2" />
        {translations.torrentInfoTitle}
      </h2>
      
      {/* Torrent Image */}
      <div className="mb-6">
        <div className="flex justify-center">
          {loading ? (
            <div className="w-48 h-48 bg-text-secondary/10 rounded-lg animate-pulse"></div>
          ) : image ? (
            <Image
              src={`data:image/jpeg;base64,${image}`}
              alt="Torrent preview"
              width={384}
              height={384}
              className="max-w-full max-h-96 rounded-lg shadow-lg"
            />
          ) : null}
        </div>
      </div>
      
      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <span className="text-text-secondary block text-sm">{translations.size}</span>
          {loading ? (
            <div className="w-16 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text font-medium">{formatFileSize(size)}</span>
          )}
        </div>
        <div>
          <span className="text-text-secondary block text-sm">{translations.type}</span>
          {loading ? (
            <div className="w-12 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text font-medium">{type || 'N/A'}</span>
          )}
        </div>
        <div>
          <span className="text-text-secondary block text-sm">{translations.source}</span>
          {loading ? (
            <div className="w-16 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text font-medium">{source || 'N/A'}</span>
          )}
        </div>
        <div>
          <span className="text-text-secondary block text-sm">{translations.files}</span>
          {loading ? (
            <div className="w-8 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
          ) : (
            <span className="text-text font-medium">{files.length}</span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <span className="text-text-secondary block text-sm mb-2 flex items-center">
          <Tag size={16} className="mr-1" />
          {translations.tags}
        </span>
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-3 py-1 bg-primary/10 rounded-full animate-pulse">
                <div className="w-12 h-4 bg-primary/20 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-text-secondary text-sm">No tags available</span>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-text mb-2">{translations.description}</h3>
        {loading ? (
          <div className="space-y-2">
            <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            <div className="w-1/2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        ) : description ? (
          <p className="text-text-secondary whitespace-pre-wrap">
            {description}
          </p>
        ) : (
          <span className="text-text-secondary text-sm">No description available</span>
        )}
      </div>

      {/* NFO File */}
      {nfo && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-text mb-2">{translations.nfoFile}</h3>
          {loading ? (
            <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="w-full h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-text-secondary text-sm whitespace-pre-wrap font-mono">
                {nfo}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 