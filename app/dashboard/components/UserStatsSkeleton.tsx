/**
 * User Stats Skeleton Component
 * Shows loading state for user statistics in the header
 */

import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { BarChartSquare } from '@styled-icons/boxicons-regular/BarChartSquare';
import { Award } from '@styled-icons/boxicons-regular/Award';

export default function UserStatsSkeleton() {
  return (
    <>
      {/* User Stats Skeleton */}
      <div className="hidden lg:flex items-center space-x-4 text-sm text-text-secondary">
        <div className="flex items-center space-x-1">
          <Upload size={18} className="text-green-500" />
          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-1">
          <Download size={18} className="text-red-500" />
          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-1">
          <BarChartSquare size={18} className="text-blue-500" />
          <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-1">
          <Award size={18} className="text-yellow-500" />
          <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-1">
          <Award size={18} className="text-pink-500" />
          <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="hidden md:block">
        <div className="w-64 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>

      {/* Upload Button Skeleton */}
      <div className="hidden md:block">
        <div className="w-20 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>

      {/* User Dropdown Skeleton */}
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="hidden md:block w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </>
  );
} 