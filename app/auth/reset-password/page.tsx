/**
 * Reset Password page component
 * Handles password reset with token validation
 * Provides form to enter new password
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
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
      <AuthCard title="Reset Password">
        <div className="text-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('auth.resetPassword.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={t('auth.password')}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
          autoFocus
        />
        
        <AuthInput
          label={t('auth.register.confirmPassword')}
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-background py-2 rounded 
                   hover:bg-primary-dark transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('common.loading') : t('auth.resetPassword.button')}
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