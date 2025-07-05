"use client"

import { signOut } from "next-auth/react"
import { useI18n } from "@/app/hooks/useI18n"
import { Button } from "@/app/components/ui/Button"

/**
 * LogoutButton Component
 * 
 * A button component that handles user logout functionality.
 * Features:
 * - Integration with NextAuth.js for secure logout
 * - Internationalized button text
 * - Loading state during logout process
 * - Responsive design
 * - Hydration mismatch prevention
 */
export function LogoutButton() {
  // Custom hook for internationalization
  const { t, isReady } = useI18n()

  /**
   * Handles the logout process
   * Signs out the user using NextAuth.js and redirects to home page
   */
  const handleLogout = async () => {
    try {
      // Sign out using NextAuth.js with redirect to home page
      await signOut({
        callbackUrl: "/", // Redirect to home page after logout
        redirect: true, // Enable automatic redirect
      })
    } catch (error) {
      // Log error for debugging (logout errors are rare but should be handled)
      console.error("Error during logout:", error)
    }
  }

  // Don't render until i18n is ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <Button variant="outline" size="sm">
        auth.logout
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="text-foreground-secondary hover:text-foreground"
    >
      {t("auth.logout")}
    </Button>
  )
} 