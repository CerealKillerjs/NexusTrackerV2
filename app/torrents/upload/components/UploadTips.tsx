/**
 * Upload Tips Component
 * 
 * Displays upload tips and information box
 */

'use client';

import { useI18n } from '@/app/hooks/useI18n';
import { InfoCircle } from '@styled-icons/boxicons-regular/InfoCircle';

interface UploadTipsProps {
  loading?: boolean;
}

export default function UploadTips({ loading = false }: UploadTipsProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="flex-1">
            <div className="w-32 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="space-y-1">
              <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-1/2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-2/3 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <InfoCircle size={20} className="text-blue-500 mt-0.5" />
        <div>
          <h3 className="font-semibold text-text mb-1">{t('upload.tips.title')}</h3>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• {t('upload.tips.list.0')}</li>
            <li>• {t('upload.tips.list.1')}</li>
            <li>• {t('upload.tips.list.2')}</li>
            <li>• {t('upload.tips.list.3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 