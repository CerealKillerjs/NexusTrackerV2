"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

/**
 * AuthProvider Component
 *
 * Provides authentication context to the application using NextAuth.js.
 * Wraps the app with SessionProvider so that authentication state
 * and session data are available throughout the component tree.
 *
 * @param children - React children components that require authentication context
 */
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
} 