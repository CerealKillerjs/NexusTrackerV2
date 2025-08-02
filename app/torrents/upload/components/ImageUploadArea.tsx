/**
 * Image Upload Area Component
 * 
 * Handles image file upload with preview functionality
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useI18n } from '@/app/hooks/useI18n';
import { File } from '@styled-icons/boxicons-regular/File';
import { X } from '@styled-icons/boxicons-regular/X';

interface ImageUploadAreaProps {
  uploadedImage: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  loading?: boolean;
}

export default function ImageUploadArea({
  uploadedImage,
  imagePreview,
  onImageSelect,
  onImageRemove,
  loading = false
}: ImageUploadAreaProps) {
  const { t } = useI18n();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
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
      <div className="text-center">
        {!uploadedImage ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
              <File size={24} className="text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t('upload.imageUpload.title')}
            </h3>
            <p className="text-text-secondary mb-4">
              {t('upload.imageUpload.subtitle')}
            </p>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
            >
              {t('upload.imageUpload.selectButton')}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-lg shadow-lg"
              />
            )}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text">{uploadedImage.name}</h3>
              <p className="text-text-secondary">
                {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={onImageRemove}
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