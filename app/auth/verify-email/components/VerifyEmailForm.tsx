/**
 * Verify Email Form Component
 * Client component for handling email verification with token validation
 * Provides verification status and navigation options
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface VerifyEmailFormProps {
  translations: {
    title: string;
    verifying: string;
    success: string;
    error: string;
    missingToken: string;
    verificationFailed: string;
    goToSignIn: string;
    goToSignUp: string;
  };
}

export default function VerifyEmailForm({ translations }: VerifyEmailFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage(translations.missingToken);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || translations.success);
          toast.success(data.message || translations.success);
        } else {
          setStatus("error");
          setMessage(data.error || translations.error);
          toast.error(data.error || translations.error);
        }
      } catch (error) {
        console.error('Error during email verification:', error);
        setStatus("error");
        setMessage(translations.verificationFailed);
        toast.error(translations.verificationFailed);
      }
    };

    verify();
  }, [searchParams, translations]);

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="text-center">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-text-secondary">{translations.verifying}</p>
        </div>
      )}
      
      {status === "success" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-green-600 dark:text-green-400 font-semibold">{message}</p>
          <button
            className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-medium"
            onClick={handleSignIn}
          >
            {translations.goToSignIn}
          </button>
        </div>
      )}
      
      {status === "error" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="text-red-600 dark:text-red-400 font-semibold">{message}</p>
          <button
            className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-medium"
            onClick={handleSignUp}
          >
            {translations.goToSignUp}
          </button>
        </div>
      )}
    </div>
  );
} 