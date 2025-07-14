/**
 * HomeContent Component
 * Client component for the home page with interactive elements
 * Handles client-side interactions while using server translations
 */

'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hooks/useI18n';

interface HomeContentProps {
  serverTranslations: {
    loginText: string;
    registerText: string;
    description: string;
    aboutText: string;
    statsText: string;
    apiText: string;
    title: string;
    subtitle: string;
    welcomeTitle: string;
    welcomeDescription: string;
  };
}

export function HomeContent({ serverTranslations }: HomeContentProps) {
  const { t } = useI18n();

  // Get server translations with fallbacks
  const getServerTranslation = (key: keyof typeof serverTranslations, fallbackKey: string) => {
    return serverTranslations[key] || t(fallbackKey);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl tracking-tighter text-primary mb-4">
            <span className="text-primary">Nexus</span><span className="text-accent">Tracker</span> <span className="text-text-secondary text-4xl">V2</span>
          </h1>
          <p className="text-text-secondary text-lg">
            {getServerTranslation('subtitle', 'home.description')}
          </p>
        </div>
        
        <div className="flex space-x-6 mb-8">
          <Link 
            href="/auth/signin"
            className="px-8 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors font-medium text-lg"
          >
            {getServerTranslation('loginText', 'home.footer.login')}
          </Link>
          <Link 
            href="/auth/signup"
            className="px-8 py-3 bg-surface border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-medium text-lg"
          >
            {getServerTranslation('registerText', 'home.footer.register')}
          </Link>
        </div>

        <div className="text-center text-text-secondary">
          <p className="mb-4">
            {getServerTranslation('welcomeTitle', 'home.welcome.title')}
          </p>
          <p className="text-sm">
            {getServerTranslation('welcomeDescription', 'home.welcome.description')}
          </p>
        </div>
      </main>

      <footer className="text-center p-8 bg-surface border-t border-border">
        <p className="text-text-secondary mb-4">
          {getServerTranslation('description', 'home.footer.description')}
        </p>
        <nav className="flex justify-center space-x-4">
          <Link href="/about" className="text-text hover:text-primary transition-colors">
            {getServerTranslation('aboutText', 'home.footer.about')}
          </Link>
          <span className="text-border">|</span>
          <Link href="/stats" className="text-text hover:text-primary transition-colors">
            {getServerTranslation('statsText', 'home.footer.stats')}
          </Link>
          <span className="text-border">|</span>
          <Link href="/api" className="text-text hover:text-primary transition-colors">
            {getServerTranslation('apiText', 'home.footer.api')}
          </Link>
        </nav>
      </footer>
    </div>
  );
} 