/**
 * PrivateHomePage Component
 * 
 * Modern login/register page for private mode
 * Features a beautiful hero section with modern card-based authentication options
 * Used when PUBLIC_BROWSING_MODE is set to 'PRIVATE'
 */

'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

export default function PrivateHomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-surface">
      {/* Header */}
      <header className="flex justify-start items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">N</span>
          </div>
          <span className="text-text font-semibold">NexusTracker</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="text-primary">Nexus</span>
              <span className="text-accent">Tracker</span>
              <span className="text-text-secondary text-3xl md:text-4xl ml-2">V2</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>
          
          <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl">
            <h2 className="text-2xl font-semibold text-text mb-2">
              Welcome to NexusTracker
            </h2>
            <p className="text-text-secondary mb-8">
              Please sign in or create an account to access the tracker
            </p>
            
            {/* Authentication Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sign In Card */}
              <div className="group relative">
                <Link href="/auth/signin" className="block">
                  <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2 text-center">
                      {t('home.footer.login')}
                    </h3>
                    <p className="text-text-secondary text-sm text-center">
                      Access your account and manage your torrents
                    </p>
                  </div>
                </Link>
              </div>

              {/* Sign Up Card */}
              <div className="group relative">
                <Link href="/auth/signup" className="block">
                  <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4 mx-auto">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2 text-center">
                      {t('home.footer.register')}
                    </h3>
                    <p className="text-text-secondary text-sm text-center">
                      Create a new account and start sharing
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Forgot Password?
                </Link>
                <span className="text-border">•</span>
                <Link 
                  href="/about" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {t('home.footer.about')}
                </Link>
                <span className="text-border">•</span>
                <Link 
                  href="/stats" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {t('home.footer.stats')}
                </Link>
              </div>
            </div>
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