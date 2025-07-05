import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/app/lib/utils"

/**
 * Input component interface
 * Extends HTML input attributes and adds custom props for label and error display
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string // Optional label text to display above the input
  error?: string // Optional error message to display below the input
}

/**
 * Input Component
 * 
 * A reusable input component with label, error handling, and consistent styling.
 * Features:
 * - Optional label with proper accessibility
 * - Error message display with red styling
 * - Focus and hover states
 * - Disabled state styling
 * - Responsive design
 * - Forwarded ref support for form integration
 * - Proper ARIA attributes for accessibility
 * 
 * @param props - InputProps object containing input configuration
 * @param ref - Forwarded ref for DOM access
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    // Generate unique ID for input if not provided (for label association)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {/* Label element - only rendered if label prop is provided */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        
        {/* Input element with styling and accessibility attributes */}
        <input
          id={inputId}
          className={cn(
            // Base input styles
            "flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600",
            "bg-white dark:bg-gray-800 px-3 py-2 text-sm",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            // Error state styling - red border and ring when error exists
            error && "border-red-500 focus:ring-red-500",
            // Additional custom classes
            className
          )}
          ref={ref}
          // ARIA attributes for accessibility
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {/* Error message - only rendered if error prop is provided */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

// Set display name for better debugging experience
Input.displayName = "Input" 