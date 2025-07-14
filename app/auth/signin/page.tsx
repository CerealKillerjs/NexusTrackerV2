/**
 * Login page component - Optimized for maximum performance
 * Server Component with direct database access and server-side translations
 * Minimal client-side JavaScript for better performance
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getRegistrationMode } from '@/app/lib/config';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import AuthCard from '../../components/auth/AuthCard';
import SignInForm from '../../components/auth/SignInForm';
import { FormFieldSkeleton, ButtonSkeleton, TextSkeleton } from '../../components/ui/Skeleton';
import { LanguageSync } from '../../components/ui/LanguageSync';

// Enhanced loading component with theme-consistent styling
function SignInLoading() {
  return (
    <div className="space-y-6">
      {/* Form fields skeleton */}
      <div className="space-y-4">
        <FormFieldSkeleton label="Login" placeholder="Ingresa tu email o usuario" />
        <FormFieldSkeleton label="Contraseña" placeholder="Ingresa tu contraseña" />
        <ButtonSkeleton />
      </div>

      {/* Links skeleton */}
      <div className="space-y-4">
        <div className="text-center">
          <TextSkeleton width="w-32" />
        </div>
        <div className="text-center">
          <TextSkeleton width="w-48" />
        </div>
      </div>
    </div>
  );
}

export default async function LoginPage() {
  // Get headers for language detection
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);
  
  // Direct database access - no HTTP overhead
  const registrationMode = await getRegistrationMode();

  // Server-side translations with debug logging
  const title = serverT('auth.signin.title', language);
  const loginLabel = serverT('auth.login', language);
  const passwordLabel = serverT('auth.password', language);
  const loginPlaceholder = serverT('auth.placeholders.login', language);
  const passwordPlaceholder = serverT('auth.placeholders.password', language);
  
  // Additional translations to prevent poping
  const submitButton = serverT('auth.signin.button', language);
  const loadingText = serverT('common.loading', language);
  const forgotPassword = serverT('auth.signin.forgotPassword', language);
  const noAccount = serverT('auth.signin.noAccount', language);
  const signUpLink = serverT('auth.signin.signUpLink', language);
  
  // Error messages
  const loginRequired = serverT('auth.errors.loginRequired', language);
  const loginMinLength = serverT('auth.errors.loginMinLength', language);
  const passwordRequired = serverT('auth.errors.passwordRequired', language);
  const passwordMinLength = serverT('auth.errors.passwordMinLength', language);
  const userBanned = serverT('auth.errors.userBanned', language);
  const invalidCredentials = serverT('auth.register.errors.invalidCredentials', language);
  const successLogin = serverT('auth.notification.successLogin', language);
  const errorNotification = serverT('auth.notification.error', language);

  // Debug logging
  console.log('🔍 Server Translations Debug:', {
    language,
    title,
    loginLabel,
    passwordLabel,
    loginPlaceholder,
    passwordPlaceholder,
    submitButton,
    loadingText,
    forgotPassword,
    noAccount,
    signUpLink
  });

  return (
    <>
      <LanguageSync serverLanguage={language} />
      <AuthCard title={title}>
        <Suspense fallback={<SignInLoading />}>
          <SignInForm 
            registrationMode={registrationMode} 
            language={language}
            serverTranslations={{
              loginLabel,
              passwordLabel,
              loginPlaceholder,
              passwordPlaceholder,
              submitButton,
              loadingText,
              forgotPassword,
              noAccount,
              signUpLink,
              loginRequired,
              loginMinLength,
              passwordRequired,
              passwordMinLength,
              userBanned,
              invalidCredentials,
              successLogin,
              errorNotification
            }}
          />
        </Suspense>
      </AuthCard>
    </>
  );
} 