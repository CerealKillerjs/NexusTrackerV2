/**
 * NFO Upload Area Component
 * 
 * Handles NFO file upload functionality
 */

'use client';

import { useRef } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import { File } from '@styled-icons/boxicons-regular/File';
import { X } from '@styled-icons/boxicons-regular/X';

interface NfoUploadAreaProps {
  uploadedNfo: File | null;
  onNfoSelect: (file: File) => void;
  onNfoRemove: () => void;
  loading?: boolean;
}

export default function NfoUploadArea({
  uploadedNfo,
  onNfoSelect,
  onNfoRemove,
  loading = false
}: NfoUploadAreaProps) {
  const { t } = useI18n();
  const nfoInputRef = useRef<HTMLInputElement>(null);

  const handleNfoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onNfoSelect(file);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border-2 border-dashed border-border p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="w-48 h-4 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
          <div className="w-24 h-8 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border-2 border-dashed border-border p-6">
      {!uploadedNfo ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <File size={24} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary mb-4">
            {t('upload.nfoUpload.subtitle')}
          </p>
          <button
            type="button"
            onClick={() => nfoInputRef.current?.click()}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t('upload.nfoUpload.selectButton')}
          </button>
          <input
            ref={nfoInputRef}
            type="file"
            accept=".nfo"
            onChange={handleNfoInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <File size={48} className="text-green-500" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text">{uploadedNfo.name}</h3>
            <p className="text-text-secondary">
              {(uploadedNfo.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onNfoRemove}
            className="p-2 text-text-secondary hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
} 