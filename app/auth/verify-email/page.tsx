/**
 * Verify Email page component
 * Server Component for email verification with token validation
 * Provides verification status with server-side translations
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/lib/auth';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import AuthCard from '@/app/components/auth/AuthCard';
import VerifyEmailForm from '@/app/components/auth/VerifyEmailForm';
import VerifyEmailSkeleton from '@/app/components/auth/VerifyEmailSkeleton';
import { LanguageSync } from '@/app/components/ui/LanguageSync';

export default async function VerifyEmailPage() {
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
    title: serverT('auth.emailVerification.verify.title', language),
    verifying: serverT('auth.emailVerification.verify.verifying', language),
    success: serverT('auth.emailVerification.verify.success', language),
    error: serverT('auth.emailVerification.verify.error', language),
    missingToken: serverT('auth.emailVerification.verify.missingToken', language),
    verificationFailed: serverT('auth.emailVerification.verify.verificationFailed', language),
    goToSignIn: serverT('auth.emailVerification.verify.goToSignIn', language),
    goToSignUp: serverT('auth.emailVerification.verify.goToSignUp', language),
  };

  return (
    <>
      <LanguageSync serverLanguage={language} />
      <AuthCard title={translations.title}>
        <Suspense fallback={<VerifyEmailSkeleton />}>
          <VerifyEmailForm translations={translations} />
        </Suspense>
      </AuthCard>
    </>
  );
} 