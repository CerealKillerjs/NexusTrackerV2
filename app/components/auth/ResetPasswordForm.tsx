/**
 * Reset Password Form Component
 * Client component for handling password reset with token validation
 * Provides form to enter new password with instant validation
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import AuthInput from './AuthInput';

interface ResetPasswordFormProps {
  translations: {
    title: string;
    subtitle: string;
    button: string;
    password: string;
    confirmPassword: string;
    passwordMatch: string;
    passwordRequirements: string;
    loading: string;
    rememberPassword: string;
    signIn: string;
    dontHaveAccount: string;
    signUp: string;
    invalidToken: string;
    success: string;
    error: string;
  };
}

export default function ResetPasswordForm({ translations }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setTokenValid(true);
    } else {
      toast.error(translations.invalidToken);
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router, translations.invalidToken]);

  // Validate password on change
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return translations.passwordRequirements;
    }
    return '';
  };

  // Validate confirm password on change
  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== formData.password) {
      return translations.passwordMatch;
    }
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    
    // Clear confirm password error if passwords now match
    if (formData.confirmPassword && newPassword === formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    
    // Validate password
    const passwordError = validatePassword(newPassword);
    setErrors(prev => ({ ...prev, password: passwordError }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: newConfirmPassword }));
    
    // Validate confirm password
    const confirmPasswordError = validateConfirmPassword(newConfirmPassword);
    setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    
    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError
    });

    // Check if there are any errors
    if (passwordError || confirmPasswordError) {
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
        toast.success(data.message || translations.success);
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        toast.error(data.error || translations.error);
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      toast.error(translations.error);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="text-center">
        <p className="text-text-secondary">{translations.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={translations.password}
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
          error={errors.password}
          required
          autoFocus
        />
        
        <AuthInput
          label={translations.confirmPassword}
          type="password"
          value={formData.confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={errors.confirmPassword}
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-background py-2 rounded 
                   hover:bg-primary-dark transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? translations.loading : translations.button}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-text-secondary">
          {translations.rememberPassword}{' '}
        </span>
        <Link 
          href="/auth/signin"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {translations.signIn}
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-text-secondary">
          {translations.dontHaveAccount}{' '}
        </span>
        <Link 
          href="/auth/signup"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {translations.signUp}
        </Link>
      </div>
    </div>
  );
} 