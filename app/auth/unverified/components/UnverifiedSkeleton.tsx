/**
 * Unverified Skeleton Component
 * Loading skeleton for unverified email form
 * Matches the visual structure of the actual form
 */

export default function UnverifiedSkeleton() {
  return (
    <div className="text-center space-y-4">
      {/* Icon skeleton */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
      </div>
      
      {/* Message skeleton */}
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-64 mx-auto animate-pulse"></div>
      
      {/* Button skeleton */}
      <div className="mt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
      </div>
      
      {/* Link skeleton */}
      <div className="mt-6">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-56 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
} 