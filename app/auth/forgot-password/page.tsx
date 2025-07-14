/**
 * Forgot Password page component - Optimized for maximum performance
 * Server Component with direct database access and server-side translations
 * Minimal client-side JavaScript for better performance
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/lib/auth';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import AuthCard from '../../components/auth/AuthCard';
import { ForgotPasswordForm } from '@/app/components/auth/ForgotPasswordForm';
import { FormFieldSkeleton, ButtonSkeleton, TextSkeleton } from '../../components/ui/Skeleton';
import { LanguageSync } from '../../components/ui/LanguageSync';

// Enhanced loading component with theme-consistent styling
function ForgotPasswordLoading() {
  return (
    <div className="space-y-6">
      {/* Form fields skeleton */}
      <div className="space-y-4">
        <FormFieldSkeleton label="Correo electrónico o Usuario" placeholder="Ingresa tu correo electrónico o usuario" />
        <ButtonSkeleton />
      </div>

      {/* Links skeleton */}
      <div className="space-y-4">
        <div className="text-center">
          <TextSkeleton width="w-64" />
        </div>
        <div className="text-center">
          <TextSkeleton width="w-48" />
        </div>
      </div>
    </div>
  );
}

export default async function ForgotPasswordPage() {
  // Get headers for language detection
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);
  
  // Check authentication server-side
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Server-side translations with debug logging
  const title = serverT('auth.forgotPassword.title', language);
  const loginLabel = serverT('auth.login', language);
  const submitButton = serverT('auth.forgotPassword.button', language);
  const rememberPassword = serverT('auth.forgotPassword.rememberPassword', language);
  const signInButton = serverT('auth.signin.button', language);
  const noAccount = serverT('auth.signin.noAccount', language);
  const signUpLink = serverT('auth.signin.signUpLink', language);
  
  // Error messages
  const successMessage = serverT('auth.forgotPassword.success', language);
  const errorMessage = serverT('auth.forgotPassword.error', language);
  const generalError = serverT('auth.notification.error', language);
  const loadingText = serverT('common.loading', language);

  // Debug logging
  console.log('🔍 ForgotPassword Page Server Translations:', {
    language,
    title,
    loginLabel,
    submitButton,
    rememberPassword,
    signInButton,
    noAccount,
    signUpLink
  });

  return (
    <>
      <LanguageSync serverLanguage={language} />
      <AuthCard title={title}>
        <Suspense fallback={<ForgotPasswordLoading />}>
          <ForgotPasswordForm 
            language={language}
            serverTranslations={{
              title,
              loginLabel,
              submitButton,
              rememberPassword,
              signInButton,
              noAccount,
              signUpLink,
              successMessage,
              errorMessage,
              generalError,
              loadingText
            }}
          />
        </Suspense>
      </AuthCard>
    </>
  );
} 