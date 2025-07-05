import { SignUpForm } from "@/app/components/auth/SignUpForm"

/**
 * Sign Up Page Component
 * 
 * A dedicated page for user registration that renders the SignUpForm component.
 * Features:
 * - Centered layout for optimal user experience
 * - Responsive design that works on all screen sizes
 * - Clean, minimal interface focused on registration
 * - Consistent styling with the rest of the application
 * 
 * This page serves as:
 * - Entry point for new users to create accounts
 * - Standalone registration interface
 * - Integration point for the SignUpForm component
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignUpForm />
      </div>
    </div>
  )
} 