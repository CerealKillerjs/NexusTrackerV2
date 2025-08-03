/**
 * AdminWrapper - Server Component (Optimized)
 * 
 * Optimized admin wrapper with server-side authentication and data fetching
 * Features:
 * - Server-side authentication and admin verification
 * - Server-side translations and branding
 * - Optimized loading with Suspense
 * - Professional admin interface
 * - Hybrid approach: Server Component with Client Components where needed
 */

import { ReactNode } from 'react';
import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import { getBrandingConfig } from '@/app/lib/branding';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { LanguageSync } from '@/app/components/ui/LanguageSync';

interface AdminWrapperProps {
  children: ReactNode;
}

export default async function AdminWrapper({ children }: AdminWrapperProps) {
  // Verificar autenticación en el servidor
  const session = await auth();
  
  // Redirigir a login si no está autenticado
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Redirigir a página de verificación si el email no está verificado
  if (session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
    redirect('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
  }

  // Verificar si el usuario es admin en el servidor
  const isAdmin = session.user?.role === 'ADMIN';
  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Obtener el branding name desde el servidor
  const brandingConfig = await getBrandingConfig();
  const brandingName = brandingConfig?.BRANDING_NAME || "NexusTracker V2";

  // Detectar idioma dinámicamente desde headers y cookies
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Precargar traducciones del sidebar de administración en el servidor
  const navItems = [
    { href: '/admin', label: serverT('admin.nav.dashboard', language), icon: 'Home' },
    { href: '/admin/users', label: serverT('admin.nav.users', language), icon: 'User' },
    { href: '/admin/torrents', label: serverT('admin.nav.torrents', language), icon: 'Download' },
    { href: '/admin/settings', label: serverT('admin.nav.settings', language), icon: 'Cog' },
  ];

  return (
    <>
      <LanguageSync serverLanguage={language} />
      <div className="min-h-screen bg-background">
        {/* Header (Server Component) */}
        <Suspense fallback={
          <div className="h-16 bg-surface border-b border-border fixed top-0 left-0 right-0 z-30">
            <div className="flex items-center justify-between h-full px-6">
              <div className="w-40 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
              <div className="w-64 h-8 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          </div>
        }>
          <AdminHeader brandingName={brandingName} language={language} />
        </Suspense>

        {/* Sidebar (Client Component) */}
        <Suspense fallback={
          <div className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-16 z-20">
            <div className="p-4">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-text-secondary/10 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <AdminSidebar navItems={navItems} />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 ml-64 pt-20 p-6">
          <Suspense fallback={
            <div className="w-full h-96 bg-text-secondary/10 rounded-lg animate-pulse"></div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </>
  );
} 