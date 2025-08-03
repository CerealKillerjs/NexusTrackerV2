/**
 * Admin Dashboard Page - Server Component
 * 
 * Main admin dashboard page with server-side rendering
 * Features:
 * - Server-side translations and data fetching
 * - Optimized loading with Suspense
 * - Professional admin interface
 */

import { Suspense } from 'react';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import { headers } from 'next/headers';
import { auth } from '@/app/lib/auth';
import AdminWrapper from './components/AdminWrapper';
import getAdminStats from './components/AdminStats';

// Admin Dashboard Skeleton Component
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
        <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
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

      {/* Coming Soon Section */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-4">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-text">Coming Soon</h3>
        </div>
        <div className="space-y-3">
          <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          <div className="w-1/2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  // Detectar idioma dinámicamente desde headers y cookies
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Obtener sesión del usuario para el nombre
  const session = await auth();
  const username = session?.user?.username || session?.user?.email || 'Admin';

  // Obtener estadísticas reales de la base de datos
  const stats = await getAdminStats();

  // Precargar traducciones en el servidor
  const translations = {
    title: serverT('admin.dashboard.title', language),
    welcome: serverT('admin.dashboard.welcome', language).replace('{{username}}', username),
    comingSoonTitle: serverT('admin.dashboard.comingSoon.title', language),
    comingSoonDescription: serverT('admin.dashboard.comingSoon.description', language),
  };

  return (
    <AdminWrapper>
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">{translations.title}</h1>
                <p className="text-text-secondary">{translations.welcome}</p>
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {translations.comingSoonDescription}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-text-secondary">Total</span>
              </div>
              <div className="text-2xl font-bold text-text">{stats.totalUsers}</div>
              <p className="text-sm text-text-secondary">Users</p>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-text-secondary">Total</span>
              </div>
              <div className="text-2xl font-bold text-text">{stats.totalTorrents}</div>
              <p className="text-sm text-text-secondary">Torrents</p>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-text-secondary">Active</span>
              </div>
              <div className="text-2xl font-bold text-text">{stats.totalAdmins}</div>
              <p className="text-sm text-text-secondary">Admins</p>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-text-secondary">System</span>
              </div>
              <div className="text-2xl font-bold text-text">{stats.systemStatus}</div>
              <p className="text-sm text-text-secondary">Status</p>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-text">{translations.comingSoonTitle}</h3>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {translations.comingSoonDescription}
            </p>
          </div>
        </div>
      </Suspense>
    </AdminWrapper>
  );
} 