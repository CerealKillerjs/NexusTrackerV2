/**
 * Admin Users Management Page - Server Component
 * 
 * Main admin users page with server-side rendering
 * Features:
 * - Server-side translations and data fetching
 * - Optimized loading with Suspense
 * - Professional admin interface
 * - Real-time user statistics
 */

import { Suspense } from 'react';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import { headers } from 'next/headers';
import AdminWrapper from '../components/AdminWrapper';
import getUsersStats from './components/UsersStats';
import UsersTable from './components/UsersTable';
import UsersStatsDisplay from './components/UsersStatsDisplay';
import UsersHeader from './components/UsersHeader';

// Users Page Skeleton Component
function UsersPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="w-64 h-8 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
        <div className="w-96 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg animate-pulse"></div>
              <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
            <div className="w-20 h-8 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface-light">
          <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-text-secondary/10 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminUsersPage() {
  // Detectar idioma dinámicamente desde headers y cookies
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Obtener estadísticas reales de usuarios
  const stats = await getUsersStats();

  // Precargar traducciones en el servidor
  const translations = {
    title: serverT('admin.users.title', language),
    description: serverT('admin.users.description', language),
  };

  return (
    <AdminWrapper>
      <Suspense fallback={<UsersPageSkeleton />}>
        <div className="space-y-6">
          {/* Header */}
          <UsersHeader title={translations.title} description={translations.description} />

          {/* Quick Stats Grid */}
          <UsersStatsDisplay stats={stats} />

          {/* Users Table */}
          <UsersTable />
        </div>
      </Suspense>
    </AdminWrapper>
  );
} 