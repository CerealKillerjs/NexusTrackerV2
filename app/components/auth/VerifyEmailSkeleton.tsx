/**
 * Verify Email Skeleton Component
 * Loading skeleton for email verification form
 * Matches the visual structure of the actual verification process
 */

export default function VerifyEmailSkeleton() {
  return (
    <div className="text-center space-y-4">
      {/* Loading spinner skeleton */}
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 dark:border-gray-600"></div>
      </div>
      
      {/* Text skeleton */}
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto animate-pulse"></div>
      
      {/* Button skeleton (hidden during loading but prepared for transitions) */}
      <div className="mt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
} 