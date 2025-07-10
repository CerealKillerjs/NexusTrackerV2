"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import AuthCard from "@/app/components/auth/AuthCard";
import { showNotification } from "@/app/utils/notifications";
import { useI18n } from "@/app/hooks/useI18n";

function UnverifiedForm() {
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
    } catch {
      showNotification.error(t('auth.emailVerification.unverified.resendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={t('auth.emailVerification.unverified.title')}>
      <div className="text-center">
        <p className="text-red-600 font-semibold mb-4">
          {t('auth.emailVerification.unverified.message')}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? t('auth.emailVerification.unverified.resending') : t('auth.emailVerification.unverified.resendButton')}
        </button>
        <div className="mt-6 text-sm text-text-secondary">
          <span>
            {t('auth.emailVerification.unverified.alreadyVerified')}{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => router.push('/auth/signin')}
            >
              {t('auth.emailVerification.unverified.goToSignIn')}
            </button>
          </span>
        </div>
      </div>
    </AuthCard>
  );
}

export default function UnverifiedPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Email Verification">
        <div className="text-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </AuthCard>
    }>
      <UnverifiedForm />
    </Suspense>
  );
} 