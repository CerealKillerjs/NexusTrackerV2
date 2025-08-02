/**
 * Uploader Info Component
 * 
 * Displays uploader information with optimized loading:
 * - User avatar (skeleton)
 * - Username (skeleton)
 * - Ratio (skeleton)
 * - Uploaded/Downloaded stats (skeleton)
 * 
 * This component shows static UI immediately and skeletons only for dynamic data
 */

'use client';

import { User } from '@styled-icons/boxicons-regular/User';

interface UploaderInfoProps {
  anonymous: boolean;
  user?: {
    username: string;
    ratio: number;
    uploaded: number;
    downloaded: number;
  };
  loading?: boolean;
  translations: {
    uploaderTitle: string;
    anonymous: string;
    user: string;
    ratio: string;
    uploaded: string;
    downloaded: string;
  };
}

export default function UploaderInfo({ 
  anonymous, 
  user, 
  loading = false, 
  translations 
}: UploaderInfoProps) {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
        <User size={20} className="mr-2" />
        {translations.uploaderTitle}
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            {loading ? (
              <>
                <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse mb-1"></div>
                <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <p className="text-text font-medium">
                  {anonymous ? translations.anonymous : user?.username || translations.user}
                </p>
                {!anonymous && user && (
                  <p className="text-text-secondary text-sm">
                    {translations.ratio.replace('{{ratio}}', user.ratio.toFixed(2))}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {!anonymous && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">{translations.uploaded}</span>
              {loading ? (
                <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
              ) : (
                <span className="text-text">{user ? formatFileSize(user.uploaded) : '0 B'}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{translations.downloaded}</span>
              {loading ? (
                <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
              ) : (
                <span className="text-text">{user ? formatFileSize(user.downloaded) : '0 B'}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 