/**
 * Reset Password page component
 * Server Component for password reset with token validation
 * Provides form to enter new password with server-side translations
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/lib/auth';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import AuthCard from '@/app/components/auth/AuthCard';
import ResetPasswordForm from '@/app/components/auth/ResetPasswordForm';
import ResetPasswordSkeleton from '@/app/components/auth/ResetPasswordSkeleton';

export default async function ResetPasswordPage() {
  // Check if user is already authenticated
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  // Get language from headers
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Prepare translations for the client component
  const translations = {
    title: serverT('auth.resetPassword.title', language),
    subtitle: serverT('auth.resetPassword.subtitle', language),
    button: serverT('auth.resetPassword.button', language),
    password: serverT('auth.password', language),
    confirmPassword: serverT('auth.register.confirmPassword', language),
    passwordMatch: serverT('auth.register.errors.passwordMatch', language),
    passwordRequirements: serverT('auth.register.errors.passwordRequirements', language),
    loading: serverT('common.loading', language),
    rememberPassword: serverT('auth.forgotPassword.rememberPassword', language),
    signIn: serverT('auth.signin.title', language),
    dontHaveAccount: serverT('auth.register.hasAccount', language),
    signUp: serverT('auth.register.title', language),
    invalidToken: 'Invalid reset link. Please request a new password reset.',
    success: serverT('auth.resetPassword.success', language),
    error: serverT('auth.resetPassword.error', language),
  };

  return (
    <AuthCard title={translations.title}>
      <Suspense fallback={<ResetPasswordSkeleton />}>
        <ResetPasswordForm translations={translations} />
      </Suspense>
    </AuthCard>
  );
} 