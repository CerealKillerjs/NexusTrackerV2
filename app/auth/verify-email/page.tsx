"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/app/hooks/useI18n";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage(t('auth.emailVerification.verify.missingToken'));
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || t('auth.emailVerification.verify.success'));
        } else {
          setStatus("error");
          setMessage(data.error || t('auth.emailVerification.verify.error'));
        }
      } catch (e) {
        setStatus("error");
        setMessage(t('auth.emailVerification.verify.verificationFailed'));
      }
    };
    verify();
  }, [searchParams, t]);

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
              {status === "loading" && (
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              
              {status === "success" && (
                <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4 mx-auto">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {status === "error" && (
                <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4 mx-auto">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('auth.emailVerification.verify.title')}
              </h1>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              {status === "loading" && (
                <p className="text-text-secondary">{t('auth.emailVerification.verify.verifying')}</p>
              )}
              
              {status === "success" && (
                <>
                  <p className="text-green-600 font-medium mb-4">{message}</p>
                  <p className="text-text-secondary text-sm mb-4">
                    Your email has been successfully verified. You can now sign in to your account.
                  </p>
                  <button
                    className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => router.push("/auth/signin")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t('auth.emailVerification.verify.goToSignIn')}
                  </button>
                </>
              )}
              
              {status === "error" && (
                <>
                  <p className="text-red-600 font-medium mb-4">{message}</p>
                  <p className="text-text-secondary text-sm mb-4">
                    The verification link is invalid or has expired. Please try signing up again.
                  </p>
                  <button
                    className="w-full bg-primary text-background py-3 rounded-lg font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => router.push("/auth/signup")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {t('auth.emailVerification.verify.goToSignUp')}
                  </button>
                </>
              )}
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