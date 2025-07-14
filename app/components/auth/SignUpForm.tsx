/**
 * SignUpForm Component - Optimized for maximum performance and UX
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
import PasswordStrengthBar from './PasswordStrengthBar';
import { useRouter } from 'next/navigation';
import { showNotification } from '@/app/utils/notifications';

interface SignUpFormProps {
  registrationMode: string;
  language?: string;
  serverTranslations?: {
    title: string;
    usernameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submitButton: string;
    hasAccount: string;
    loginLink: string;
    usernameError: string;
    emailError: string;
    passwordRequirementsError: string;
    passwordMatchError: string;
    invalidCredentialsError: string;
    successRegister: string;
    errorNotification: string;
    registrationClosedTitle: string;
    registrationClosedMessage: string;
    registrationClosedDescription: string;
    goToLogin: string;
    alreadyHaveAccount: string;
    signInHere: string;
    // Password strength translations
    securityRecommendations: string;
    weak: string;
    fair: string;
    good: string;
    strong: string;
    minLength: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
  };
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
  general?: string;
}

export function SignUpForm({ 
  registrationMode, 
  serverTranslations 
}: SignUpFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteLoading] = useState(false);
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
    if (name === 'username') {
      if (!value.trim()) {
        return getServerTranslation('usernameError', 'auth.register.errors.username') || 'El usuario debe tener entre 3 y 20 caracteres';
      }
      if (value.length < 3 || value.length > 20) {
        return getServerTranslation('usernameError', 'auth.register.errors.username') || 'El usuario debe tener entre 3 y 20 caracteres';
      }
    }
    
    if (name === 'email') {
      if (!value.trim()) {
        return getServerTranslation('emailError', 'auth.register.errors.email') || 'Por favor ingresa un correo electrónico válido';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return getServerTranslation('emailError', 'auth.register.errors.email') || 'Por favor ingresa un correo electrónico válido';
      }
    }
    
    if (name === 'password') {
      if (!value) {
        return getServerTranslation('passwordRequirementsError', 'auth.register.errors.passwordRequirements') || 'La contraseña debe tener al menos 6 caracteres';
      }
      if (value.length < 6) {
        return getServerTranslation('passwordRequirementsError', 'auth.register.errors.passwordRequirements') || 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    
    if (name === 'confirmPassword') {
      if (!value) {
        return getServerTranslation('passwordMatchError', 'auth.register.errors.passwordMatch') || 'Las contraseñas no coinciden';
      }
      if (value !== formData.password) {
        return getServerTranslation('passwordMatchError', 'auth.register.errors.passwordMatch') || 'Las contraseñas no coinciden';
      }
    }
    
    return undefined;
  }, [formData.password, getServerTranslation]);

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
    return formData.username.trim() && 
           formData.email.trim() && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword &&
           formData.username.length >= 3 && 
           formData.username.length <= 20 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
           formData.password.length >= 6 &&
           !Object.values(errors).some(error => error);
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    // Validate all fields
    const newErrors: FormErrors = {};
    const usernameError = validateField('username', formData.username);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    
    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    setErrors({});

    try {
      const requestBody: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        inviteCode?: string;
      } = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      // Add invite code if present
      if (inviteCode) {
        requestBody.inviteCode = inviteCode;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': navigator.language.startsWith('en') ? 'en' : 'es',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      if (response.ok) {
        showNotification.success(
          getServerTranslation('successRegister', 'auth.notification.successRegister')
        );
        router.push('/auth/signin');
      } else {
        showNotification.error(data.error || data.message || getServerTranslation('errorNotification', 'auth.notification.error'));
        
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showNotification.error(getServerTranslation('errorNotification', 'auth.notification.error'));
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Show registration closed message if registration is closed
  if (registrationMode === 'closed') {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          {getServerTranslation('registrationClosedTitle', 'auth.register.registrationClosed')}
        </h2>
        <p className="text-text-secondary mb-6">
          {getServerTranslation('registrationClosedMessage', 'auth.register.registrationClosedMessage')}
        </p>
        <p className="text-sm text-text-secondary mb-6">
          {getServerTranslation('registrationClosedDescription', 'auth.register.registrationClosedDescription')}
        </p>
        <div className="space-y-3">
          <Link 
            href="/auth/signin"
            className="inline-block px-6 py-2 bg-primary text-background rounded hover:bg-primary-dark transition-colors"
          >
            {getServerTranslation('goToLogin', 'auth.register.goToLogin')}
          </Link>
          <div className="text-xs text-text-secondary">
            {getServerTranslation('alreadyHaveAccount', 'auth.register.alreadyHaveAccount')}{' '}
            <Link href="/auth/signin" className="text-primary hover:text-primary-dark">
              {getServerTranslation('signInHere', 'auth.register.signInHere')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Invite Code Display */}
      {inviteCode && (
        <div className="mb-4 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">
                Código de Invitación: <code className="font-mono text-primary">{inviteCode}</code>
              </p>
              {inviteLoading ? (
                <p className="text-xs text-text-secondary">Validando código...</p>
              ) : inviteValid === true ? (
                <p className="text-xs text-green-600">✓ Código válido</p>
              ) : inviteValid === false ? (
                <p className="text-xs text-red-600">✗ Código inválido o expirado</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setInviteCode('');
                setFormData(prev => ({ ...prev, inviteCode: '' }));
                setInviteValid(null);
              }}
              className="text-xs text-text-secondary hover:text-text"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <AuthInput
          label={getServerTranslation('usernameLabel', 'auth.register.username')}
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
          required
        />
        <AuthInput
          label={getServerTranslation('emailLabel', 'auth.register.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />
        <AuthInput
          label={getServerTranslation('passwordLabel', 'auth.register.password')}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />
        <PasswordStrengthBar 
          password={formData.password} 
          serverTranslations={{
            securityRecommendations: getServerTranslation('securityRecommendations', 'auth.register.securityRecommendations'),
            weak: getServerTranslation('weak', 'auth.register.passwordStrength.weak'),
            fair: getServerTranslation('fair', 'auth.register.passwordStrength.fair'),
            good: getServerTranslation('good', 'auth.register.passwordStrength.good'),
            strong: getServerTranslation('strong', 'auth.register.passwordStrength.strong'),
            minLength: getServerTranslation('minLength', 'auth.register.passwordRequirements.minLength'),
            uppercase: getServerTranslation('uppercase', 'auth.register.passwordRequirements.uppercase'),
            lowercase: getServerTranslation('lowercase', 'auth.register.passwordRequirements.lowercase'),
            number: getServerTranslation('number', 'auth.register.passwordRequirements.number'),
            special: getServerTranslation('special', 'auth.register.passwordRequirements.special')
          }}
        />
        <AuthInput
          label={getServerTranslation('confirmPasswordLabel', 'auth.register.confirmPassword')}
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />
        
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-primary text-background py-2 rounded 
                   hover:bg-primary-dark transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.loading')}
            </span>
          ) : (
            getServerTranslation('submitButton', 'auth.register.submit')
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-text-secondary">
          {getServerTranslation('hasAccount', 'auth.register.hasAccount')}{' '}
        </span>
        <Link 
          href="/auth/signin"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {getServerTranslation('loginLink', 'auth.register.login')}
        </Link>
      </div>
    </>
  );
} 