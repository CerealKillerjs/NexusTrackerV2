/**
 * Login page component
 * Handles user authentication
 * Provides login form and navigation
 */

'use client';

import { useState } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import Link from 'next/link';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
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
        showNotification.error(t('auth.register.errors.invalidCredentials'));
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
    <AuthCard title={t('auth.signin.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={t('auth.login')}
          type="text"
          value={formData.login}
          onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
          required
          autoFocus
        />
        <AuthInput
          label={t('auth.password')}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-background py-2 rounded 
                   hover:bg-primary-dark transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('common.loading') : t('auth.signin.button')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link 
          href="/auth/forgot-password"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {t('auth.signin.forgotPassword')}
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-text-secondary">
          {t('auth.signin.noAccount')}{' '}
        </span>
        <Link 
          href="/auth/signup"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {t('auth.signin.signUpLink')}
        </Link>
      </div>
    </AuthCard>
  );
} 