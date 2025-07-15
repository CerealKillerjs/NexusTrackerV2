/**
 * Reset Password Skeleton Component
 * Loading skeleton for reset password form
 * Matches the visual structure of the actual form
 */

export default function ResetPasswordSkeleton() {
  return (
    <div className="space-y-4">
      {/* Form skeleton */}
      <div className="space-y-4">
        {/* Password input skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Confirm password input skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Links skeleton */}
      <div className="mt-6 text-center text-sm">
        <div className="flex justify-center items-center space-x-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm">
        <div className="flex justify-center items-center space-x-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-36 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 