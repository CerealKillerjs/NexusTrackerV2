/**
 * Unverified page component
 * Server Component for unverified email status
 * Provides resend verification functionality with server-side translations
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/lib/auth';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import AuthCard from '../shared/AuthCard';
import UnverifiedForm from './components/UnverifiedForm';
import UnverifiedSkeleton from './components/UnverifiedSkeleton';
import { LanguageSync } from '@/app/components/ui/LanguageSync';

export default async function UnverifiedPage() {
  // Check if user is already authenticated
  const session = await auth();
  
  // Only redirect to dashboard if user is authenticated AND has verified email
  if (session && session.user && 'emailVerified' in session.user && session.user.emailVerified === true) {
    redirect('/dashboard');
  }

  // Get language from headers
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Prepare translations for the client component
  const translations = {
    title: serverT('auth.emailVerification.unverified.title', language),
    message: serverT('auth.emailVerification.unverified.message', language),
    resendButton: serverT('auth.emailVerification.unverified.resendButton', language),
    resending: serverT('auth.emailVerification.unverified.resending', language),
    resendSuccess: serverT('auth.emailVerification.unverified.resendSuccess', language),
    resendError: serverT('auth.emailVerification.unverified.resendError', language),
    alreadyVerified: serverT('auth.emailVerification.unverified.alreadyVerified', language),
    goToSignIn: serverT('auth.emailVerification.unverified.goToSignIn', language),
    logout: serverT('auth.emailVerification.unverified.logout', language),
  };

  return (
    <>
      <LanguageSync serverLanguage={language} />
      <AuthCard title={translations.title}>
        <Suspense fallback={<UnverifiedSkeleton />}>
          <UnverifiedForm translations={translations} />
        </Suspense>
      </AuthCard>
    </>
  );
} 