/**
 * Home Page
 * Displays the main page with search bar, navigation, and footer
 * Includes a search bar for quick search and navigation links
 * Shows public search or private login based on configuration
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import SearchBar from './components/SearchBar';
import { useTranslation } from 'react-i18next';
import PrivateHomePage from './components/PrivateHomePage';
import { usePublicBrowsing } from './hooks/usePublicBrowsing';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, loading, error } = usePublicBrowsing();

  // Redirect authenticated users to dashboard in private mode
  useEffect(() => {
    if (mode === 'PRIVATE' && status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [mode, status, router]);

  // Show loading while checking configuration
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-red-500 text-lg">Error loading configuration</div>
      </div>
    );
  }

  // Private mode - show simple login/register page
  if (mode === 'PRIVATE') {
    if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-text text-lg">Loading...</div>
        </div>
      );
    }

    return <PrivateHomePage />;
  }

  // Public mode - show the original design (current page.tsx content)
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <main className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl tracking-tighter text-primary">
            Nexus<span className="text-accent">Tracker</span> <span className="text-text-secondary text-4xl">V2</span>
          </h1>
          <small className="block mt-2 text-text-secondary">
            {t('home.subtitle')}
          </small>
        </div>
        
        <SearchBar />

        <nav className="mt-8 text-center">
          <Link href="/browse" className="px-4 py-2 text-text hover:text-primary transition-colors">
            {t('home.nav.browse')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/recent" className="px-4 py-2 text-text hover:text-primary transition-colors">
            {t('home.nav.recent')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/top100" className="px-4 py-2 text-text hover:text-primary transition-colors">
            {t('home.nav.top')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/stats" className="px-4 py-2 text-text hover:text-primary transition-colors">
            {t('home.nav.stats')}
          </Link>
        </nav>
      </main>

      <footer className="text-center p-8 bg-surface border-t border-border">
        <p className="text-text-secondary mb-4">{t('home.footer.description')}</p>
        <nav>
          <Link href="/auth/signin" className="px-4 text-text hover:text-primary transition-colors">
            {t('home.footer.login')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/auth/signup" className="px-4 text-text hover:text-primary transition-colors">
            {t('home.footer.register')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/about" className="px-4 text-text hover:text-primary transition-colors">
            {t('home.footer.about')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/stats" className="px-4 text-text hover:text-primary transition-colors">
            {t('home.footer.stats')}
          </Link>
          <span className="text-border mx-2">|</span>
          <Link href="/api" className="px-4 text-text hover:text-primary transition-colors">
            {t('home.footer.api')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
