"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/app/hooks/useI18n"
import { Button } from "@/app/components/ui/Button"
import { Input } from "@/app/components/ui/Input"
import { createSignInSchema, type SignInInput } from "@/app/lib/validations"
import i18n from "@/app/lib/i18n"

/**
 * SignInForm Component
 * 
 * A form component for user authentication that handles sign-in functionality.
 * Features:
 * - Email and password validation
 * - Dynamic validation schemas based on current language
 * - Integration with NextAuth.js for authentication
 * - Toast notifications for success/error feedback
 * - Responsive design with loading states
 * - Hydration mismatch prevention
 */
export function SignInForm() {
  // Loading state for form submission
  const [isLoading, setIsLoading] = useState(false)
  // Error state for displaying validation/authentication errors
  const [error, setError] = useState("")
  // Next.js router for navigation
  const router = useRouter()
  // Custom hook for internationalization
  const { t, isReady } = useI18n()

  // Create dynamic schema based on current language
  const [schema, setSchema] = useState(createSignInSchema())

  // Update validation schema when language changes
  useEffect(() => {
    if (isReady) {
      const currentLang = i18n.language || 'es'
      setSchema(createSignInSchema(currentLang))
    }
  }, [isReady]) // Removed i18n.language from dependencies as it's not a valid dependency

  // React Hook Form setup with Zod validation
  const {
    register, // Function to register form fields
    handleSubmit, // Function to handle form submission
    formState: { errors }, // Form validation errors
  } = useForm<SignInInput>({
    resolver: zodResolver(schema), // Use Zod for validation
  })

  /**
   * Handles form submission for user authentication
   * Validates credentials and attempts to sign in the user
   * @param data - Form data containing email and password
   */
  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)
    setError("")

    try {
      // Attempt to sign in using NextAuth.js credentials provider
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Don't redirect automatically, handle it manually
      })

      if (result?.error) {
        // Display error message if authentication fails
        setError(t("auth.errors.invalidCredentials"))
      } else {
        // Redirect to dashboard on successful authentication
        router.push("/dashboard")
        router.refresh() // Refresh the page to update session state
      }
    } catch {
      // Handle unexpected errors during authentication
      setError(t("auth.errors.signInError"))
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until i18n is ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            auth.signin.title
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            auth.signin.subtitle
          </p>
        </div>
        {/* Loading skeleton while i18n initializes */}
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Form header with title and subtitle */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("auth.signin.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t("auth.signin.subtitle")}
        </p>
      </div>

      {/* Sign-in form with validation */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email input field */}
        <Input
          label={t("auth.email")}
          type="email"
          placeholder={t("auth.placeholders.email")}
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password input field */}
        <Input
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.placeholders.password")}
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Error message display */}
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit button with loading state */}
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          {t("auth.signin.button")}
        </Button>
      </form>

      {/* Link to sign up page for users without accounts */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t("auth.signin.noAccount")}{" "}
          <a
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t("auth.signin.signUpLink")}
          </a>
        </p>
      </div>
    </div>
  )
} 