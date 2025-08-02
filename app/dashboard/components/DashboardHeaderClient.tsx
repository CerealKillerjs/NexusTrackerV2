'use client';

import { Suspense } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import DashboardUserMenu from './DashboardUserMenu';
import UserStatsLoader from './UserStatsLoader';
import UploadButton from './UploadButton';

interface DashboardHeaderClientProps {
  brandingName?: string;
}

export default function DashboardHeaderClient({ 
  brandingName = "NexusTracker V2" 
}: DashboardHeaderClientProps) {
  const { t, isReady } = useI18n();

  // Precargar traducciones del cliente
  const translations = {
    searchPlaceholder: isReady ? t('header.search.placeholder') : '',
    upload: isReady ? t('header.upload') : '',
    profile: isReady ? t('header.userMenu.profile') : '',
    adminPanel: isReady ? t('header.userMenu.adminPanel') : '',
    moderatorPanel: isReady ? t('header.userMenu.moderatorPanel') : '',
    logout: isReady ? t('header.userMenu.logout') : '',
  };

  return (
    <header className="bg-surface border-b border-border h-16 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary">
            {brandingName}
          </h1>
        </div>

        {/* Right side - User stats, search, upload, and user menu */}
        <div className="flex items-center space-x-4">
          {/* User Stats (Client Component) */}
          <Suspense fallback={
            <div className="hidden lg:flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.707 7.293L8 9.586V3a1 1 0 0 1 1-1z" />
                </svg>
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.707 7.293L8 9.586V3a1 1 0 0 1 1-1z" />
                </svg>
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5zM8 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7zM14 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4z" />
                </svg>
                <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
            </div>
          }>
            <UserStatsLoader />
          </Suspense>

          {/* Search Bar */}
          <form className="hidden md:block">
            <input
              type="text"
              placeholder={translations.searchPlaceholder}
              className="w-64 px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              disabled
            />
          </form>

          {/* Upload Button (Client Component) */}
          <Suspense fallback={
            <button
              className="hidden md:flex items-center px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              disabled
            >
              {/* Icono de subida */}
              <svg className="mr-2" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 15h2V6h3l-4-5-4 5h3v9zm-5 4h12v-2H6v2z"/>
              </svg>
              {translations.upload}
            </button>
          }>
            <UploadButton uploadText={translations.upload} />
          </Suspense>

          {/* User Menu (Client Component) */}
          <Suspense fallback={
            <div className="flex items-center space-x-2 px-3 py-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="hidden md:block w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          }>
            <DashboardUserMenu translations={translations} />
          </Suspense>
        </div>
      </div>
    </header>
  );
} 