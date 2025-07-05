"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useI18n } from "@/app/hooks/useI18n"
import { Button } from "@/app/components/ui/Button"
import { Input } from "@/app/components/ui/Input"
import { showNotification } from "@/app/utils/notifications"
import { createSignUpSchema, type SignUpInput } from "@/app/lib/validations"
import i18n from "@/app/lib/i18n"

/**
 * SignUpForm Component
 * 
 * A form component for user registration that handles account creation.
 * Features:
 * - Username, email, password, and confirm password validation
 * - Dynamic validation schemas based on current language
 * - Toast notifications for success/error feedback using react-hot-toast
 * - Automatic redirection to login after successful registration
 * - Form reset after successful submission
 * - Responsive design with loading states
 * - Hydration mismatch prevention
 */
export function SignUpForm() {
  // Loading state for form submission
  const [isLoading, setIsLoading] = useState(false)
  // Error state for displaying validation/registration errors
  const [error, setError] = useState("")
  
  // Next.js router for navigation
  const router = useRouter()
  // Custom hook for internationalization
  const { t, isReady } = useI18n()

  // Create dynamic schema based on current language
  const [schema, setSchema] = useState(createSignUpSchema())

  // Update validation schema when language changes
  useEffect(() => {
    if (isReady) {
      const currentLang = i18n.language || 'es'
      setSchema(createSignUpSchema(currentLang))
    }
  }, [isReady])

  // React Hook Form setup with Zod validation
  const {
    register, // Function to register form fields
    handleSubmit, // Function to handle form submission
    formState: { errors }, // Form validation errors
    reset // Function to reset form to initial state
  } = useForm<SignUpInput>({
    resolver: zodResolver(schema), // Use Zod for validation
  })

  /**
   * Handles form submission for user registration
   * Validates form data, sends registration request, and handles response
   * @param data - Form data containing username, email, password, and confirm password
   */
  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true)
    setError("")

    try {
      // Get current language for API request headers
      const currentLang = i18n.language || 'es'
      
      // Send registration request to API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": currentLang, // Send language preference to API
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Handle API errors (validation errors, duplicate email/username, etc.)
        const errorData = await response.json()
        const errorMessage = errorData.error || t("auth.errors.registrationFailed")
        setError(errorMessage)
        showNotification.error(errorMessage)
        return
      }

      // Registration successful - show success message
      showNotification.success(t("auth.toast.registrationSuccess"))
      
      // Reset form to clear all fields
      reset()
      
      // Redirect to login page after 2 seconds to allow user to see success message
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)

    } catch {
      // Handle network errors or unexpected exceptions
      const errorMessage = t("auth.toast.networkError")
      setError(errorMessage)
      showNotification.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until i18n is ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            auth.signup.title
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            auth.signup.subtitle
          </p>
        </div>
        {/* Loading skeleton while i18n initializes */}
        <div className="space-y-4">
          <div className="h-10 bg-background-tertiary animate-pulse rounded"></div>
          <div className="h-10 bg-background-tertiary animate-pulse rounded"></div>
          <div className="h-10 bg-background-tertiary animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Form header with title and subtitle */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t("auth.signup.title")}
        </h1>
        <p className="mt-2 text-sm text-foreground-secondary">
          {t("auth.signup.subtitle")}
        </p>
      </div>

      {/* Registration form with validation */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username input field */}
        <Input
          label={t("auth.username")}
          type="text"
          placeholder={t("auth.placeholders.username")}
          error={errors.username?.message}
          {...register("username")}
        />

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

        {/* Confirm password input field */}
        <Input
          label={t("auth.confirmPassword")}
          type="password"
          placeholder={t("auth.placeholders.password")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Error message display */}
        {error && (
          <div className="rounded-md bg-error/10 border border-error/20 p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Submit button with loading state */}
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          {t("auth.signup.button")}
        </Button>
      </form>

      {/* Link to sign in page for users with existing accounts */}
      <div className="text-center">
        <p className="text-sm text-foreground-secondary">
          {t("auth.signup.hasAccount")}{" "}
          <a
            href="/auth/signin"
            className="font-medium text-accent hover:text-accent/80"
          >
            {t("auth.signup.signInLink")}
          </a>
        </p>
      </div>
    </div>
  )
} 