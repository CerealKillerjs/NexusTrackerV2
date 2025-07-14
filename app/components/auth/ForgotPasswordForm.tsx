/**
 * ForgotPasswordForm Component - Optimized for maximum performance and UX
 * Client component with instant validation and minimal JS
 * Enhanced accessibility and error handling
 * Supports server-side translations for better performance
 * Maintains exact visual appearance of original form
 */

'use client';

import { useState, useCallback } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
import Link from 'next/link';
import AuthInput from './AuthInput';
import { showNotification } from '@/app/utils/notifications';

interface ForgotPasswordFormProps {
  language?: string;
  serverTranslations?: {
    title: string;
    loginLabel: string;
    submitButton: string;
    rememberPassword: string;
    signInButton: string;
    noAccount: string;
    signUpLink: string;
    successMessage: string;
    errorMessage: string;
    generalError: string;
    loadingText: string;
  };
}

interface FormData {
  login: string;
}

interface FormErrors {
  login?: string;
  general?: string;
}

export function ForgotPasswordForm({ serverTranslations }: ForgotPasswordFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<FormData>({
    login: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get server translations with fallbacks
  const getServerTranslation = useCallback((key: string, fallbackKey: string) => {
    if (serverTranslations && key in serverTranslations) {
      return serverTranslations[key as keyof typeof serverTranslations];
    }
    return t(fallbackKey);
  }, [serverTranslations, t]);

  // Instant validation
  const validateField = useCallback((name: keyof FormData, value: string): string | undefined => {
    if (name === 'login') {
      if (!value.trim()) {
        return 'Por favor ingresa tu correo electrónico o usuario';
      }
    }
    return undefined;
  }, []);

  // Handle input changes with instant validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Instant validation
    const error = validateField(name as keyof FormData, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [errors, validateField]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return formData.login.trim() && !Object.values(errors).some(error => error);
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    // Validate all fields
    const newErrors: FormErrors = {};
    const loginError = validateField('login', formData.login);
    
    if (loginError) newErrors.login = loginError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    setErrors({});

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
        showNotification.success(data.message || getServerTranslation('successMessage', 'auth.forgotPassword.success'));
        setFormData({ login: '' }); // Clear the form
      } else {
        showNotification.error(data.error || getServerTranslation('errorMessage', 'auth.forgotPassword.error'));
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      showNotification.error(getServerTranslation('generalError', 'auth.notification.error'));
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        label={getServerTranslation('loginLabel', 'auth.login')}
        type="text"
        name="login"
        value={formData.login}
        onChange={handleInputChange}
        error={errors.login}
        required
        autoFocus
        disabled={loading}
      />
      
      <button
        type="submit"
        disabled={loading || !isFormValid()}
        className="w-full bg-primary text-background py-2 rounded 
                 hover:bg-primary-dark transition-colors font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? getServerTranslation('loadingText', 'common.loading') : getServerTranslation('submitButton', 'auth.forgotPassword.button')}
      </button>

      <div className="mt-6 text-center text-sm">
        <span className="text-text-secondary">
          {getServerTranslation('rememberPassword', 'auth.forgotPassword.rememberPassword')}{' '}
        </span>
        <Link 
          href="/auth/signin"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {getServerTranslation('signInButton', 'auth.signin.button')}
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-text-secondary">
          {getServerTranslation('noAccount', 'auth.signin.noAccount')}{' '}
        </span>
        <Link 
          href="/auth/signup"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {getServerTranslation('signUpLink', 'auth.signin.signUpLink')}
        </Link>
      </div>
    </form>
  );
} 