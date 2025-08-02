/**
 * Upload Options Component
 * 
 * Handles upload options like anonymous and freeleech
 */

'use client';

import { useI18n } from '@/app/hooks/useI18n';

interface UploadOptionsProps {
  anonymous: boolean;
  freeleech: boolean;
  onAnonymousChange: (value: boolean) => void;
  onFreeleechChange: (value: boolean) => void;
  loading?: boolean;
}

export default function UploadOptions({
  anonymous,
  freeleech,
  onAnonymousChange,
  onFreeleechChange,
  loading = false
}: UploadOptionsProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => onAnonymousChange(e.target.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />
        <span className="text-text">{t('upload.form.options.anonymous')}</span>
      </label>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={freeleech}
          onChange={(e) => onFreeleechChange(e.target.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />
        <span className="text-text">{t('upload.form.options.freeleech')}</span>
      </label>
    </div>
  );
} 