/**
 * Torrent Upload Area Component
 * 
 * Handles torrent file upload with drag & drop functionality
 */

'use client';

import { useRef } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { File } from '@styled-icons/boxicons-regular/File';
import { X } from '@styled-icons/boxicons-regular/X';

interface TorrentUploadAreaProps {
  uploadedFile: File | null;
  isDragOver: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  loading?: boolean;
}

export default function TorrentUploadArea({
  uploadedFile,
  isDragOver,
  onFileSelect,
  onFileRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  loading = false
}: TorrentUploadAreaProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border-2 border-dashed border-border p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
          <div className="w-64 h-4 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
          <div className="w-32 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border-2 border-dashed border-border p-8">
      <div
        className={`text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!uploadedFile ? (
          <>
            <Upload size={64} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">
              {t('upload.torrentUpload.title')}
            </h3>
            <p className="text-text-secondary mb-4">
              {t('upload.torrentUpload.subtitle')}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
            >
              {t('upload.torrentUpload.selectButton')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".torrent"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <File size={48} className="text-green-500" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-text">{uploadedFile.name}</h3>
              <p className="text-text-secondary">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={onFileRemove}
              className="p-2 text-text-secondary hover:text-text transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 