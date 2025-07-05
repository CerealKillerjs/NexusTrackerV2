"use client"

import { I18nextProvider } from "react-i18next"
import { ReactNode } from "react"
import i18n from "../lib/i18n"

/**
 * I18nProvider Component
 *
 * Provides internationalization (i18n) context to the application using react-i18next.
 * Wraps the app with I18nextProvider so that translation functions and language state
 * are available throughout the component tree.
 *
 * @param children - React children components that require i18n context
 */
interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
} 