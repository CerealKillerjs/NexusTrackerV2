/**
 * Reset Password page component
 * Handles password reset with token validation and modern design
 * Provides form to enter new password with requirements feedback
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormField } from '../../components/ui/FigmaFloatingLabelInput';
import PasswordStrengthBar from '../../components/auth/PasswordStrengthBar';
import PasswordRequirementsCard from '../../components/auth/PasswordRequirementsCard';
import { showNotification } from '@/app/utils/notifications';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setTokenValid(true);
    } else {
      showNotification.error('Invalid reset link. Please request a new password reset.');
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  // Show password requirements when user starts typing password
  useEffect(() => {
    if (formData.password.length > 0) {
      setShowPasswordRequirements(true);
    } else {
      setShowPasswordRequirements(false);
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showNotification.error(t('auth.register.errors.passwordMatch'));
      return;
    }

    if (formData.password.length < 6) {
      showNotification.error(t('auth.register.errors.passwordRequirements'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': navigator.language.startsWith('en') ? 'en' : 'es',
        },
        body: JSON.stringify({
          token: token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification.success(data.message || 'Password reset successfully!');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        showNotification.error(data.error || t('auth.notification.error'));
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      showNotification.error(t('auth.notification.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">Loading...</div>
      </div>
    );
  }

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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('auth.resetPassword.title')}
              </h1>
              <p className="text-text-secondary text-sm">
                Enter your new password below
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <FormField
                  label={t('auth.password')}
                  value={formData.password}
                  onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  placeholder="Enter your new password"
                  type="password"
                />
                
                {/* Password Requirements Card */}
                <PasswordRequirementsCard 
                  password={formData.password} 
                  isVisible={showPasswordRequirements} 
                />
                
                {/* Password Strength Bar */}
                <PasswordStrengthBar password={formData.password} />
              </div>
              
              <FormField
                label={t('auth.register.confirmPassword')}
                value={formData.confirmPassword}
                onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                placeholder="Confirm your new password"
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {loading ? t('common.loading') : t('auth.resetPassword.button')}
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