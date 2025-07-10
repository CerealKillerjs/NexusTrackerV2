"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { showNotification } from "@/app/utils/notifications";
import { useI18n } from "@/app/hooks/useI18n";

export default function UnverifiedPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = searchParams.get("login") || "";
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification.success(data.message || t('auth.emailVerification.unverified.resendSuccess'));
      } else {
        showNotification.error(data.error || t('auth.emailVerification.unverified.resendError'));
      }
    } catch (e) {
      showNotification.error(t('auth.emailVerification.unverified.resendError'));
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4 mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('auth.emailVerification.unverified.title')}
              </h1>
              <p className="text-red-600 font-medium mb-4">
                {t('auth.emailVerification.unverified.message')}
              </p>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <p className="text-text-secondary text-sm">
                Please check your email and click the verification link to activate your account.
              </p>
              
              <button
                className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleResend}
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {loading ? t('auth.emailVerification.unverified.resending') : t('auth.emailVerification.unverified.resendButton')}
              </button>
            </div>

            {/* Links */}
            <div className="mt-6 text-center pt-4 border-t border-border/50">
              <span className="text-text-secondary text-sm">
                {t('auth.emailVerification.unverified.alreadyVerified')}{' '}
              </span>
              <button
                className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                onClick={() => router.push('/auth/signin')}
              >
                {t('auth.emailVerification.unverified.goToSignIn')}
              </button>
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