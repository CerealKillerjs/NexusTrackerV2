import { ReactNode } from 'react';
import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import { getBrandingConfig } from '@/app/lib/branding';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import { LanguageSync } from '@/app/components/ui/LanguageSync';

interface DashboardWrapperProps {
  children: ReactNode;
}

export default async function DashboardWrapper({ children }: DashboardWrapperProps) {
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

  // Obtener el branding name desde el servidor
  const brandingConfig = await getBrandingConfig();
  const brandingName = brandingConfig?.BRANDING_NAME || "NexusTracker V2";

  // Detectar idioma dinámicamente desde headers y cookies
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Precargar traducciones del sidebar en el servidor
  const navItems = [
    { href: '/dashboard', label: serverT('sidebar.nav.home', language), icon: 'Home' },
    { href: '/categories', label: serverT('sidebar.nav.categories', language), icon: 'ListUl' },
    { href: '/requests', label: serverT('sidebar.nav.requests', language), icon: 'HelpCircle' },
    { href: '/announcements', label: serverT('sidebar.nav.announcements', language), icon: 'News' },
    { href: '/wiki', label: serverT('sidebar.nav.wiki', language), icon: 'BookOpen' },
    { href: '/rss', label: serverT('sidebar.nav.rss', language), icon: 'Rss' },
    { href: '/bookmarks', label: serverT('sidebar.nav.bookmarks', language), icon: 'Bookmark' },
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
          <DashboardHeader brandingName={brandingName} language={language} />
        </Suspense>

        {/* Sidebar (Client Component) */}
        <Suspense fallback={
          <div className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-16 z-20">
            <div className="p-4">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-12 bg-text-secondary/10 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <DashboardSidebar navItems={navItems} />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 ml-64 pt-16 p-6">
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