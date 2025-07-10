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
import { useBranding } from './providers/BrandingProvider';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, loading, error } = usePublicBrowsing();
  const { BRANDING_LOGO_URL, BRANDING_NAME } = useBranding();

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

  // Public mode - show the modernized design
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-surface">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          {BRANDING_LOGO_URL ? (
            <img src={BRANDING_LOGO_URL} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">N</span>
            </div>
          )}
          <span className="text-text font-semibold">{BRANDING_NAME || 'NexusTracker'}</span>
        </div>
        
        {/* Header Navigation */}
        <nav className="flex items-center space-x-6">
          <Link 
            href="/auth/signin" 
            className="text-text-secondary hover:text-primary transition-colors text-sm"
          >
            {t('home.footer.login')}
          </Link>
          <Link 
            href="/auth/signup" 
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            {t('home.footer.register')}
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="mb-8">
            {(() => {
              const name = (BRANDING_NAME || 'NexusTracker V2').split(' ');
              return (
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                  <span className="text-primary">{name[0]}</span>
                  {name[1] && <span className="text-accent"> {name[1]}</span>}
                  {name[2] && <span className="text-text-secondary text-3xl md:text-4xl ml-2"> {name.slice(2).join(' ')}</span>}
                </h1>
              );
            })()}
            <p className="text-xl text-text-secondary leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>
          
          {/* Search Section */}
          <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl mb-8">
            <h2 className="text-2xl font-semibold text-text mb-2">
              Search Torrents
            </h2>
            <p className="text-text-secondary mb-6">
              Find the content you're looking for across our extensive collection
            </p>
            <SearchBar />
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/browse" className="group">
              <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-3 mx-auto">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text text-center text-sm">
                  {t('home.nav.browse')}
                </h3>
              </div>
            </Link>

            <Link href="/recent" className="group">
              <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg mb-3 mx-auto">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text text-center text-sm">
                  {t('home.nav.recent')}
                </h3>
              </div>
            </Link>

            <Link href="/top100" className="group">
              <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center justify-center w-10 h-10 bg-green/10 rounded-lg mb-3 mx-auto">
                  <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text text-center text-sm">
                  {t('home.nav.top')}
                </h3>
              </div>
            </Link>

            <Link href="/stats" className="group">
              <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow/10 rounded-lg mb-3 mx-auto">
                  <svg className="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text text-center text-sm">
                  {t('home.nav.stats')}
                </h3>
              </div>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text mb-1">Fast & Reliable</h3>
            <p className="text-text-secondary text-sm">High-performance torrent tracking</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text mb-1">Secure</h3>
            <p className="text-text-secondary text-sm">Your data is protected</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-green/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text mb-1">Community</h3>
            <p className="text-text-secondary text-sm">Join our growing community</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-8 border-t border-border/50">
        <p className="text-text-secondary mb-4 text-sm">
          {t('home.footer.description')}
        </p>
        <nav className="flex justify-center space-x-6 text-sm">
          <Link href="/about" className="text-text-secondary hover:text-primary transition-colors">
            {t('home.footer.about')}
          </Link>
          <Link href="/stats" className="text-text-secondary hover:text-primary transition-colors">
            {t('home.footer.stats')}
          </Link>
          <Link href="/api" className="text-text-secondary hover:text-primary transition-colors">
            {t('home.footer.api')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
