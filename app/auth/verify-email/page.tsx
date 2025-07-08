"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthCard from "@/app/components/auth/AuthCard";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (e) {
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      }
    };
    verify();
  }, [searchParams]);

  return (
    <AuthCard title="Verify Email">
      <div className="text-center">
        {status === "loading" && <p className="text-text-secondary">Verifying...</p>}
        {status === "success" && (
          <>
            <p className="text-green-600 font-semibold mb-2">{message}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={() => router.push("/auth/signin")}
            >
              Go to Sign In
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
              Go to Sign Up
            </button>
          </>
        )}
      </div>
    </AuthCard>
  );
} 