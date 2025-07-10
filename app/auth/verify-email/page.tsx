"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthCard from "@/app/components/auth/AuthCard";
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
      } catch {
        setStatus("error");
        setMessage(t('auth.emailVerification.verify.verificationFailed'));
      }
    };
    verify();
  }, [searchParams, t]);

  return (
    <AuthCard title={t('auth.emailVerification.verify.title')}>
      <div className="text-center">
        {status === "loading" && <p className="text-text-secondary">{t('auth.emailVerification.verify.verifying')}</p>}
        {status === "success" && (
          <>
            <p className="text-green-600 font-semibold mb-2">{message}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={() => router.push("/auth/signin")}
            >
              {t('auth.emailVerification.verify.goToSignIn')}
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-600 font-semibold mb-2">{message}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={() => router.push("/auth/signup")}
            >
              {t('auth.emailVerification.verify.goToSignUp')}
            </button>
          </>
        )}
      </div>
    </AuthCard>
  );
} 