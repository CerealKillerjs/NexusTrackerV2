/**
 * Upload Actions Component
 * 
 * Handles upload action buttons (cancel, upload)
 */

'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/app/hooks/useI18n';
import { Upload } from '@styled-icons/boxicons-regular/Upload';

interface UploadActionsProps {
  isValid: boolean;
  hasFile: boolean;
  isUploading: boolean;
  onCancel?: () => void;
  loading?: boolean;
}

export default function UploadActions({
  isValid,
  hasFile,
  isUploading,
  onCancel,
  loading = false
}: UploadActionsProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-end space-x-4">
        <div className="w-24 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
        <div className="w-32 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={handleCancel}
        className="px-6 py-3 border border-border text-text rounded-lg hover:bg-surface-light transition-colors"
      >
        {t('upload.actions.cancel')}
      </button>
      <button
        type="submit"
        disabled={!isValid || !hasFile || isUploading}
        className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <Upload size={20} />
        <span>{isUploading ? t('upload.actions.uploading') : t('upload.actions.upload')}</span>
      </button>
    </div>
  );
} 