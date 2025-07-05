import { SignInForm } from "@/app/components/auth/SignInForm"

/**
 * Sign In Page Component
 * 
 * A dedicated page for user authentication that renders the SignInForm component.
 * Features:
 * - Centered layout for optimal user experience
 * - Responsive design that works on all screen sizes
 * - Clean, minimal interface focused on authentication
 * - Consistent styling with the rest of the application
 * 
 * This page serves as:
 * - Entry point for existing users to authenticate
 * - Standalone authentication interface
 * - Integration point for the SignInForm component
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignInForm />
      </div>
    </div>
  )
} 