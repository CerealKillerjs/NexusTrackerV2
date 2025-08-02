/**
 * Torrent Files Component
 * 
 * Displays torrent file list using the FileTree component
 * 
 * This component loads immediately without skeleton as it uses basic data
 */

'use client';

import { Folder } from '@styled-icons/boxicons-regular/Folder';
import FileTree from './FileTree';

interface TorrentFilesProps {
  files: Array<{ path: string; size: number }>;
  translations: {
    fileListCount: string;
  };
}

export default function TorrentFiles({ files, translations }: TorrentFilesProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
        <Folder size={20} className="mr-2" />
        {translations.fileListCount.replace('{{count}}', files.length.toString())}
      </h2>
      
      <FileTree files={files} />
    </div>
  );
} 