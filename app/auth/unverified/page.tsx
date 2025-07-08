"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/app/components/auth/AuthCard";
import { showNotification } from "@/app/utils/notifications";

export default function UnverifiedPage() {
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
        showNotification.success(data.message || "Verification email resent. Please check your inbox.");
      } else {
        showNotification.error(data.error || "Failed to resend verification email.");
      }
    } catch (e) {
      showNotification.error("Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Email Not Verified">
      <div className="text-center">
        <p className="text-red-600 font-semibold mb-4">
          Email not verified. Please verify your email to access your account.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? "Resending..." : "Resend Verification Email"}
        </button>
        <div className="mt-6 text-sm text-text-secondary">
          <span>
            Already verified?{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => router.push('/auth/signin')}
            >
              Go to Sign In
            </button>
          </span>
        </div>
      </div>
    </AuthCard>
  );
} 