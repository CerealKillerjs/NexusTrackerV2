/**
 * PrivateHomePage Component
 * 
 * Simple login/register page for private mode
 * Based on the ExternalAssets/client/pages/index.js design
 * Used when PUBLIC_BROWSING_MODE is set to 'PRIVATE'
 */

'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PrivateHomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl tracking-tighter text-primary mb-4">
            Nexus<span className="text-accent">Tracker</span> <span className="text-text-secondary text-4xl">V2</span>
          </h1>
          <p className="text-text-secondary text-lg">
            A modern BitTorrent tracker
          </p>
        </div>
        
        <div className="flex space-x-6 mb-8">
          <Link 
            href="/auth/signin"
            className="px-8 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors font-medium text-lg"
          >
            {t('home.footer.login')}
          </Link>
          <Link 
            href="/auth/signup"
            className="px-8 py-3 bg-surface border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-medium text-lg"
          >
            {t('home.footer.register')}
          </Link>
        </div>

        <div className="text-center text-text-secondary">
          <p className="mb-4">
            Welcome to NexusTracker V2
          </p>
          <p className="text-sm">
            Please login or register to access the tracker
          </p>
        </div>
      </main>

      <footer className="text-center p-8 bg-surface border-t border-border">
        <p className="text-text-secondary mb-4">{t('home.footer.description')}</p>
        <nav className="flex justify-center space-x-4">
          <Link href="/about" className="text-text hover:text-primary transition-colors">
            {t('home.footer.about')}
          </Link>
          <span className="text-border">|</span>
          <Link href="/stats" className="text-text hover:text-primary transition-colors">
            {t('home.footer.stats')}
          </Link>
          <span className="text-border">|</span>
          <Link href="/api" className="text-text hover:text-primary transition-colors">
            {t('home.footer.api')}
          </Link>
        </nav>
      </footer>
    </div>
  );
} 