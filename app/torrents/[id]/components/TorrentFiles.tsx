/**
 * Torrent Files Component
 * 
 * Displays torrent file list using the FileTree component
 * 
 * This component loads immediately without skeleton as it uses basic data
 */

'use client';

import { Folder } from '@styled-icons/boxicons-regular/Folder';
import { Search } from '@styled-icons/boxicons-regular/Search';
import FileTree from './FileTree';

interface TorrentFilesProps {
  files: Array<{ path: string; size: number }>;
  loading?: boolean;
  translations: {
    fileListCount: string;
    fileListSearch: string;
  };
}

export default function TorrentFiles({ files, loading = false, translations }: TorrentFilesProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
        <Folder size={20} className="mr-2" />
        {loading ? (
          <>
            {translations.fileListCount.replace(' ({{count}})', '')}
            <span className="text-text-secondary">(<div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse inline-block"></div>)</span>
          </>
        ) : (
          translations.fileListCount.replace('{{count}}', files.length.toString())
        )}
      </h2>
      
      {loading ? (
        <div className="space-y-4">
          {/* Search - Always visible */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder={translations.fileListSearch}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          {/* File tree skeleton */}
          <div className="bg-background border border-border rounded-lg max-h-96 overflow-y-auto">
            <div className="py-2 space-y-1">
              {/* Folder skeleton */}
              <div className="flex items-center py-1 px-2">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-4 h-4 bg-blue-500/20 rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>

              {/* File skeleton 1 */}
              <div className="flex items-center py-1 px-2" style={{ paddingLeft: '24px' }}>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>

              {/* File skeleton 2 */}
              <div className="flex items-center py-1 px-2" style={{ paddingLeft: '24px' }}>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-28 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-14 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>

              {/* File skeleton 3 */}
              <div className="flex items-center py-1 px-2" style={{ paddingLeft: '24px' }}>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-36 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-10 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>

              {/* Folder skeleton 2 */}
              <div className="flex items-center py-1 px-2">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-4 h-4 bg-blue-500/20 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>

              {/* File skeleton 4 */}
              <div className="flex items-center py-1 px-2" style={{ paddingLeft: '24px' }}>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-30 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>

              {/* File skeleton 5 */}
              <div className="flex items-center py-1 px-2" style={{ paddingLeft: '24px' }}>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-26 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                <div className="w-11 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Summary skeleton */}
          <div className="text-sm text-text-secondary">
            <div className="w-48 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>
      ) : (
        <FileTree files={files} />
      )}
    </div>
  );
} 