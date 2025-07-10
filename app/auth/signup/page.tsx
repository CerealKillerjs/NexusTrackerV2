/**
 * Register page component
 * Handles new user registration
 * Includes form validation
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import PasswordStrengthBar from '../../components/auth/PasswordStrengthBar';
import { showNotification } from '@/app/utils/notifications';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<string>('open');
  const [loading, setLoading] = useState(true);

  // Check for invite code in URL on component mount
  useEffect(() => {
    const inviteFromUrl = searchParams.get('invite');
    if (inviteFromUrl) {
      setInviteCode(inviteFromUrl);
      setFormData(prev => ({ ...prev, inviteCode: inviteFromUrl }));
      validateInviteCode(inviteFromUrl);
    }
  }, [searchParams]);

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
        setLoading(false);
      }
    };

    fetchRegistrationMode();
  }, []);

  // Validate invite code
  const validateInviteCode = async (code: string) => {
    setInviteLoading(true);
    try {
      const response = await fetch(`/api/invite/validate/${code}`);
      if (response.ok) {
        setInviteValid(true);
      } else {
        setInviteValid(false);
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
      setInviteValid(false);
    } finally {
      setInviteLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = t('auth.register.errors.username');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.register.errors.email');
    }

    if (formData.password.length < 6) {
      newErrors.password = t('auth.register.errors.passwordRequirements');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.errors.passwordMatch');
    }

    // Validate invite code if present
    if (inviteCode && inviteValid === false) {
      newErrors.inviteCode = 'Código de invitación inválido o expirado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
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
            t('auth.notification.successRegisterEmailVerify', 'Success! Please check your email to verify your account.')
          );
          router.push('/auth/signin');
        } else {
          showNotification.error(data.error || data.message || t('auth.notification.error'));
          
          if (data.errors) {
            setErrors(data.errors);
          }
        }
      } catch (error) {
        console.error('Error during registration:', error);
        showNotification.error(t('auth.notification.error'));
      }
    }
  };

  return (
    <AuthCard title={t('auth.register.title')}>
      {loading ? (
        <div className="text-center py-8">
          <div className="text-text-secondary">Cargando...</div>
        </div>
      ) : registrationMode === 'closed' ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Registro Cerrado
          </h2>
          <p className="text-text-secondary mb-6">
            En este momento no se aceptan nuevos registros en la plataforma.
          </p>
          <p className="text-sm text-text-secondary mb-6">
            Si tienes un código de invitación válido o necesitas acceso especial, 
            contacta a un administrador.
          </p>
          <div className="space-y-3">
            <Link 
              href="/auth/signin"
              className="inline-block px-6 py-2 bg-primary text-background rounded hover:bg-primary-dark transition-colors"
            >
              Ir al Login
            </Link>
            <div className="text-xs text-text-secondary">
              ¿Ya tienes una cuenta? <Link href="/auth/signin" className="text-primary hover:text-primary-dark">Inicia sesión aquí</Link>
            </div>
          </div>
        </div>
      ) : (
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
              label={t('auth.register.username')}
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              error={errors.username}
              required
            />
            <AuthInput
              label={t('auth.register.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              required
            />
            <AuthInput
              label={t('auth.register.password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={errors.password}
              required
            />
            <PasswordStrengthBar password={formData.password} />
            <AuthInput
              label={t('auth.register.confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
              required
            />
            
            <button
              type="submit"
              className="w-full bg-primary text-background py-2 rounded 
                         hover:bg-primary-dark transition-colors font-medium"
            >
              {t('auth.register.submit')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">
              {t('auth.register.hasAccount')}{' '}
            </span>
            <Link 
              href="/auth/signin"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {t('auth.register.login')}
            </Link>
          </div>
        </>
      )}
    </AuthCard>
  );
} 