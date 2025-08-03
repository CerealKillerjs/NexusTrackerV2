/**
 * Admin Settings Page - Server Component
 *
 * Página de configuraciones del panel de administración optimizada
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import AdminWrapper from '@/app/admin/components/AdminWrapper';
import SettingsContent from './components/SettingsContent';

// Skeleton para loading state
function SettingsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-surface-light rounded mb-2"></div>
        <div className="h-4 bg-surface-light rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex gap-6">
        {/* Sidebar Skeleton */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-light">
              <div className="h-6 bg-surface-light rounded"></div>
            </div>
            <div className="p-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="p-3 mb-1">
                  <div className="h-4 bg-surface-light rounded mb-1"></div>
                  <div className="h-3 bg-surface-light rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1">
          <div className="bg-surface border border-border rounded-lg p-8">
            <div className="space-y-6">
              <div className="h-6 bg-surface-light rounded mb-4"></div>
              <div className="h-4 bg-surface-light rounded mb-6"></div>
              <div className="h-10 bg-surface-light rounded mb-4"></div>
              <div className="h-10 bg-surface-light rounded mb-4"></div>
              <div className="h-10 bg-surface-light rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  // Obtener idioma preferido del usuario
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Traducciones para el componente
  const translations = {
    title: serverT('admin.settings.title', language),
    description: serverT('admin.settings.description', language),
    sections: {
      tracker: serverT('admin.settings.sections.tracker', language),
      email: serverT('admin.settings.sections.email', language),
      support: serverT('admin.settings.sections.support', language),
      registration: serverT('admin.settings.sections.registration', language),
      rateLimiting: serverT('admin.settings.sections.rateLimiting', language),
      branding: serverT('admin.settings.sections.branding', language),
      ratioSettings: serverT('admin.settings.sections.ratioSettings', language),
    },
    tracker: {
      description: serverT('admin.settings.tracker.description', language),
    },
    email: {
      description: serverT('admin.settings.email.description', language),
    },
    support: {
      description: serverT('admin.settings.support.description', language),
    },
    registration: {
      description: serverT('admin.settings.registration.description', language),
    },
    rateLimiting: {
      description: serverT('admin.settings.rateLimiting.description', language),
    },
    branding: {
      description: serverT('admin.settings.branding.description', language),
    },
    ratioSettings: {
      description: serverT('admin.settings.ratioSettings.description', language),
    },
  };

  return (
    <AdminWrapper>
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsContent translations={translations} />
      </Suspense>
    </AdminWrapper>
  );
} 