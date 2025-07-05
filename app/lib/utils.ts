import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes efficiently
 * 
 * This function combines clsx and tailwind-merge to:
 * - Merge multiple class names using clsx
 * - Resolve Tailwind CSS conflicts using tailwind-merge
 * - Ensure proper class precedence and deduplication
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged and optimized class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn("px-2 py-1", "bg-red-500")
 * // Returns: "px-2 py-1 bg-red-500"
 * 
 * // With conditional classes
 * cn("base-class", isActive && "active-class")
 * // Returns: "base-class active-class" if isActive is true
 * 
 * // Resolving conflicts
 * cn("px-2", "px-4")
 * // Returns: "px-4" (px-4 overrides px-2)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 