/**
 * Forgot Password page component
 * Handles password reset requests
 * Provides form to enter email/username for password reset
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import { showNotification } from '@/app/utils/notifications';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    login: ''
  });
  const [loading, setLoading] = useState(false);

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
    <AuthCard title={t('auth.forgotPassword.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={t('auth.login')}
          type="text"
          value={formData.login}
          onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
          required
          autoFocus
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-background py-2 rounded 
                   hover:bg-primary-dark transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('common.loading') : t('auth.forgotPassword.button')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-text-secondary">
          Remember your password?{' '}
        </span>
        <Link 
          href="/auth/signin"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          Sign in
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-text-secondary">
          Don't have an account?{' '}
        </span>
        <Link 
          href="/auth/signup"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
} 