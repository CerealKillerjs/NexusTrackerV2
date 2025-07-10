/**
 * Login page component
 * Handles user authentication with modern design
 * Provides login form and navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import Link from 'next/link';
import { FormField } from '../../components/ui/FigmaFloatingLabelInput';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { showNotification } from '@/app/utils/notifications';
import i18n from '@/app/lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<string>('open');
  const [configLoading, setConfigLoading] = useState(true);

  // Get registration mode on component mount
  useEffect(() => {
    const fetchRegistrationMode = async () => {
      try {
        const response = await fetch('/api/config/registration-mode');
        if (response.ok) {
          const data = await response.json();
          setRegistrationMode(data.registrationMode || 'open');
        }
      } catch (error) {
        console.error('Error fetching registration mode:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchRegistrationMode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if the user exists and their status
      const statusResponse = await fetch(`/api/auth/check-user-status?login=${encodeURIComponent(formData.login)}`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        // If user exists and is banned, show specific message
        if (statusData.exists && statusData.status === 'BANNED') {
          const message = t('auth.errors.userBanned');
          const currentLang = i18n.language || 'es';
          const fallbackMessage = currentLang === 'en' ? 'Your account is permanently banned' : 'Tu cuenta está permanentemente baneada';
          showNotification.error(message === 'auth.errors.userBanned' ? fallbackMessage : message);
          setLoading(false);
          return;
        }
      }

      // Proceed with normal login
      const result = await signIn('credentials', {
        login: formData.login,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          router.push('/auth/unverified?login=' + encodeURIComponent(formData.login));
        } else {
          showNotification.error(t('auth.register.errors.invalidCredentials'));
        }
      } else {
        showNotification.success(t('auth.notification.successLogin'));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
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
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">N</span>
          </div>
          <span className="text-text font-semibold">NexusTracker</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Auth Card */}
          <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('auth.signin.title')}
              </h1>
              <p className="text-text-secondary text-sm">
                {t('auth.signin.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label={t('auth.login')}
                value={formData.login}
                onChange={(value) => setFormData(prev => ({ ...prev, login: value }))}
                placeholder={t('auth.placeholders.login')}
                type="text"
              />
              
              <FormField
                label={t('auth.password')}
                value={formData.password}
                onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                placeholder={t('auth.placeholders.password')}
                type="password"
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
                {loading ? t('common.loading') : t('auth.signin.button')}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  href="/auth/forgot-password"
                  className="text-primary hover:text-primary-dark transition-colors text-sm"
                >
                  {t('auth.signin.forgotPassword')}
                </Link>
              </div>

              {/* Only show registration link if registration is not closed */}
              {registrationMode !== 'closed' && (
                <div className="text-center pt-4 border-t border-border/50">
                  <span className="text-text-secondary text-sm">
                    {t('auth.signin.noAccount')}{' '}
                  </span>
                  <Link 
                    href="/auth/signup"
                    className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                  >
                    {t('auth.signin.signUpLink')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
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