/**
 * Admin Header - Server Component
 * Renderiza la estructura básica sin depender de la sesión
 * El menú de usuario se hidrata como Client Component
 */

import { Suspense } from 'react';
import { serverT } from '@/app/lib/server-i18n';
import AdminUserMenu from './AdminUserMenu.client';

interface AdminHeaderProps {
  brandingName?: string;
  language?: string;
}

export default function AdminHeader({ 
  brandingName = "NexusTracker V2", 
  language = "es" 
}: AdminHeaderProps) {
  // Precargar traducciones del servidor con el idioma detectado
  const translations = {
    profile: serverT('header.userMenu.profile', language),
    backToSite: serverT('admin.backToSite', language),
    logout: serverT('header.userMenu.logout', language),
    adminPanel: serverT('admin.title', language),
  };

  return (
    <header className="bg-surface border-b border-border h-16 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Logo with shield icon and admin panel text */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-primary">
              {brandingName}
            </h1>
          </div>
          <span className="text-text-secondary">-</span>
          <span className="text-text-secondary font-medium">
            {translations.adminPanel}
          </span>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* User Menu (Client Component) */}
          <Suspense fallback={
            <div className="flex items-center space-x-2 px-3 py-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="hidden md:block w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          }>
            <AdminUserMenu translations={translations} />
          </Suspense>
        </div>
      </div>
    </header>
  );
} 