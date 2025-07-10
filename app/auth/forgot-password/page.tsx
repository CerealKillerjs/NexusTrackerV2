/**
 * Forgot Password page component
 * Handles password reset requests with modern design
 * Provides form to enter email/username for password reset
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { FormField } from '../../components/ui/FigmaFloatingLabelInput';
import { showNotification } from '@/app/utils/notifications';
import { useBranding } from '@/app/providers/BrandingProvider';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    login: ''
  });
  const [loading, setLoading] = useState(false);
  const { BRANDING_LOGO_URL, BRANDING_NAME } = useBranding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': navigator.language.startsWith('en') ? 'en' : 'es',
        },
        body: JSON.stringify({
          login: formData.login
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification.success(data.message || 'Password reset email sent!');
        setFormData({ login: '' }); // Clear the form
      } else {
        showNotification.error(data.error || t('auth.notification.error'));
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      showNotification.error(t('auth.notification.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-surface">
      {/* Header */}
      <header className="flex justify-start items-center p-6">
        <Link href="/" className="flex items-center space-x-2">
          {BRANDING_LOGO_URL ? (
            <img src={BRANDING_LOGO_URL} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">N</span>
            </div>
          )}
          <span className="text-text font-semibold">{BRANDING_NAME || 'NexusTracker'}</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('auth.forgotPassword.title')}
              </h1>
              <p className="text-text-secondary text-sm">
                Enter your email or username to receive a password reset link
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label={t('auth.login')}
                value={formData.login}
                onChange={(value) => setFormData(prev => ({ ...prev, login: value }))}
                placeholder="Enter your email or username"
                type="text"
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {loading ? t('common.loading') : t('auth.forgotPassword.button')}
              </button>
            </form>

            {/* Links */}
            <div className="mt-4 space-y-3">
              <div className="text-center pt-3 border-t border-border/50">
                <span className="text-text-secondary text-sm">
                  Remember your password?{' '}
                </span>
                <Link 
                  href="/auth/signin"
                  className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                >
                  Sign in
                </Link>
              </div>

              <div className="text-center">
                <span className="text-text-secondary text-sm">
                  Don't have an account?{' '}
                </span>
                <Link 
                  href="/auth/signup"
                  className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-4">
            <Link 
              href="/"
              className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 border-t border-border/50">
        <p className="text-text-secondary text-xs">
          {t('home.footer.description')}
        </p>
      </footer>
    </div>
  );
} 