/**
 * Register page component
 * Handles new user registration with modern design
 * Includes form validation and password requirements
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormField } from '../../components/ui/FigmaFloatingLabelInput';
import PasswordStrengthBar from '../../components/auth/PasswordStrengthBar';
import PasswordRequirementsCard from '../../components/auth/PasswordRequirementsCard';
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
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

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

  // Show password requirements when user starts typing password
  useEffect(() => {
    if (formData.password.length > 0) {
      setShowPasswordRequirements(true);
    } else {
      setShowPasswordRequirements(false);
    }
  }, [formData.password]);

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
        const requestBody: any = {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">Loading...</div>
      </div>
    );
  }

  if (registrationMode === 'closed') {
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
            <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-2xl text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6 mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Registration Closed
              </h2>
              <p className="text-text-secondary mb-6">
                New registrations are not currently being accepted on the platform.
              </p>
              <p className="text-sm text-text-secondary mb-8">
                If you have a valid invitation code or need special access, 
                please contact an administrator.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/auth/signin"
                  className="inline-block w-full px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Go to Login
                </Link>
                <div className="text-sm text-text-secondary">
                  Already have an account? <Link href="/auth/signin" className="text-primary hover:text-primary-dark">Sign in here</Link>
                </div>
              </div>
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
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4 mx-auto">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('auth.register.title')}
              </h1>
              <p className="text-text-secondary text-sm">
                Create your account to get started
              </p>
            </div>

            {/* Invite Code Display */}
            {inviteCode && (
              <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">
                      Invitation Code: <code className="font-mono text-primary">{inviteCode}</code>
                    </p>
                    {inviteLoading ? (
                      <p className="text-xs text-text-secondary">Validating code...</p>
                    ) : inviteValid === true ? (
                      <p className="text-xs text-green-600">✓ Valid code</p>
                    ) : inviteValid === false ? (
                      <p className="text-xs text-red-600">✗ Invalid or expired code</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteCode('');
                      setFormData(prev => ({ ...prev, inviteCode: '' }));
                      setInviteValid(null);
                    }}
                    className="text-xs text-text-secondary hover:text-text transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label={t('auth.register.username')}
                value={formData.username}
                onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
                placeholder="Enter your username"
                type="text"
              />
              
              <FormField
                label={t('auth.register.email')}
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                placeholder="Enter your email"
                type="email"
              />
              
              <div className="space-y-2">
                <FormField
                  label={t('auth.register.password')}
                  value={formData.password}
                  onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  placeholder="Enter your password"
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
                placeholder="Confirm your password"
                type="password"
              />
              
              <button
                type="submit"
                className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('auth.register.submit')}
              </button>
            </form>

            {/* Links */}
            <div className="mt-4 text-center pt-3 border-t border-border/50">
              <span className="text-text-secondary text-sm">
                {t('auth.register.hasAccount')}{' '}
              </span>
              <Link 
                href="/auth/signin"
                className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
              >
                {t('auth.register.login')}
              </Link>
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