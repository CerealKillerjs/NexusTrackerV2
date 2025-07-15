/**
 * Unverified Form Component
 * Client component for handling unverified email status
 * Provides resend verification functionality and navigation options
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface UnverifiedFormProps {
  translations: {
    title: string;
    message: string;
    resendButton: string;
    resending: string;
    resendSuccess: string;
    resendError: string;
    alreadyVerified: string;
    goToSignIn: string;
  };
}

export default function UnverifiedForm({ translations }: UnverifiedFormProps) {
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
        toast.success(data.message || translations.resendSuccess);
      } else {
        toast.error(data.error || translations.resendError);
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error(translations.resendError);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      
      <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
        {translations.message}
      </p>
      
      <button
        className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleResend}
        disabled={loading}
      >
        {loading ? translations.resending : translations.resendButton}
      </button>
      
      <div className="mt-6 text-sm text-text-secondary">
        <span>
          {translations.alreadyVerified}{' '}
          <button
            className="text-primary hover:text-primary-dark transition-colors hover:underline"
            onClick={handleSignIn}
          >
            {translations.goToSignIn}
          </button>
        </span>
      </div>
    </div>
  );
} 