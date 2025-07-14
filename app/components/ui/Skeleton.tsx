/**
 * Skeleton Component
 * Reusable loading skeleton with theme-consistent styling
 * Provides smooth animations and proper color schemes
 */

import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-text-secondary/10",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Form Field Skeleton
 * Specific skeleton for form inputs with floating labels
 */
export function FormFieldSkeleton({ label, placeholder }: { label?: string; placeholder?: string }) {
  return (
    <div className="relative mb-5">
      <div className="h-[55px] rounded-lg border-2 border-border bg-surface animate-pulse">
        {/* Floating label skeleton */}
        {label && (
          <div className="absolute left-4 -top-2 px-2 h-5 flex items-center">
            <div 
              className="w-16 h-3 bg-text-secondary/20 rounded animate-pulse"
              style={{ width: `${label.length * 0.6}rem` }}
            ></div>
          </div>
        )}
        {/* Input placeholder skeleton */}
        {placeholder && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <div 
              className="h-4 bg-text-secondary/10 rounded animate-pulse"
              style={{ width: `${placeholder.length * 0.7}rem` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Button Skeleton
 * Specific skeleton for buttons
 */
export function ButtonSkeleton() {
  return (
    <div className="h-10 bg-primary/20 rounded animate-pulse flex items-center justify-center">
      <div className="w-20 h-4 bg-primary/30 rounded animate-pulse"></div>
    </div>
  );
}

/**
 * Text Skeleton
 * Specific skeleton for text content
 */
export function TextSkeleton({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) {
  return (
    <div className={cn("bg-text-secondary/10 rounded animate-pulse", width, height)}></div>
  );
} 