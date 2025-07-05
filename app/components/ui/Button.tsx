import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/app/lib/utils"

/**
 * Button component interface
 * Extends HTML button attributes and adds custom props for styling and loading state
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean // Whether to show loading spinner
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" // Visual style variant
  size?: "sm" | "md" | "lg" // Size variant
}

/**
 * Button Component
 * 
 * A reusable button component with multiple variants, sizes, and loading states.
 * Features:
 * - Multiple visual variants (primary, secondary, outline, ghost, destructive)
 * - Different sizes (small, medium, large)
 * - Loading state with spinner animation
 * - Disabled state styling
 * - Responsive design with hover and focus states
 * - Forwarded ref support for form integration
 * 
 * @param props - ButtonProps object containing button configuration
 * @param ref - Forwarded ref for DOM access
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, loading = false, variant = "primary", size = "md", disabled, ...props }, ref) => {
    // Determine if button should be disabled (either explicitly disabled or in loading state)
    const isDisabled = disabled || loading

    /**
     * Returns CSS classes based on button variant
     * Each variant has different colors and styling for normal, hover, and disabled states
     */
    const getVariantClasses = () => {
      switch (variant) {
        case "primary":
          return "bg-accent text-background hover:bg-accent/90 focus:ring-accent disabled:bg-accent/50"
        case "secondary":
          return "bg-background-secondary text-foreground hover:bg-background-tertiary focus:ring-accent disabled:bg-background-secondary/50"
        case "outline":
          return "border border-border text-foreground hover:bg-background-secondary focus:ring-accent disabled:border-border/50 disabled:text-foreground/50"
        case "ghost":
          return "text-foreground hover:bg-background-secondary focus:ring-accent disabled:text-foreground/50"
        case "destructive":
          return "bg-error text-background hover:bg-error/90 focus:ring-error disabled:bg-error/50"
        default:
          return "bg-accent text-background hover:bg-accent/90 focus:ring-accent disabled:bg-accent/50"
      }
    }

    /**
     * Returns CSS classes based on button size
     * Each size has different padding and text size
     */
    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "px-3 py-1.5 text-sm"
        case "md":
          return "px-4 py-2 text-sm"
        case "lg":
          return "px-6 py-3 text-base"
        default:
          return "px-4 py-2 text-sm"
      }
    }

    return (
      <button
        className={cn(
          // Base button styles
          "inline-flex items-center justify-center font-medium rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
          "transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Variant and size specific styles
          getVariantClasses(),
          getSizeClasses(),
          // Additional custom classes
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner - shown when loading is true */}
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Button content (children) */}
        {children}
      </button>
    )
  }
)

// Set display name for better debugging experience
Button.displayName = "Button" 