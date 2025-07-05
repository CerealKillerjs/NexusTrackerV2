"use client"

import { useState, useEffect } from "react"
import { cn } from "@/app/lib/utils"
import i18n from "@/app/lib/i18n"
import { useI18n } from "@/app/hooks/useI18n"

/**
 * LanguageSelector Component
 * 
 * A dropdown component that allows users to switch between different languages.
 * Features:
 * - Displays current language with flag and code
 * - Dropdown menu with available languages
 * - Automatic synchronization with i18next
 * - Prevents hydration mismatches
 * - Responsive design with smooth animations
 */
export function LanguageSelector() {
  // State to control dropdown visibility
  const [isOpen, setIsOpen] = useState(false)
  // State to track current language
  const [currentLang, setCurrentLang] = useState('es')
  // Custom hook to handle i18next initialization
  const { isReady } = useI18n()

  // Available languages configuration with flags and display names
  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇺🇸" }
  ]

  // Initialize and sync with i18next when component is ready
  useEffect(() => {
    if (isReady) {
      // Get current language from i18next or localStorage, fallback to Spanish
      const lang = i18n.language || localStorage.getItem('i18nextLng') || 'es'
      setCurrentLang(lang)
    }
  }, [isReady])

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng)
    }

    // Subscribe to language change events
    i18n.on('languageChanged', handleLanguageChange)
    
    // Cleanup event listener on component unmount
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  // Find the current language object for display
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  /**
   * Handles language change when user selects a new language
   * Updates local state, closes dropdown, and changes i18next language
   * @param languageCode - The language code to switch to
   */
  const handleLanguageChange = (languageCode: string) => {
    setCurrentLang(languageCode)
    setIsOpen(false)
    i18n.changeLanguage(languageCode)
  }

  // Don't render until i18n is ready to prevent hydration mismatch
  if (!isReady) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="relative">
        {/* Main button that toggles the dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-blue-500 text-white border border-blue-600 rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {/* Language flag emoji */}
          <span className="text-lg">{currentLanguage.flag}</span>
          {/* Language code in uppercase */}
          <span className="text-sm font-medium">
            {currentLanguage.code.toUpperCase()}
          </span>
          {/* Dropdown arrow that rotates when open */}
          <svg
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu with language options */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden min-w-[140px] z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={(e) => {
                  e.stopPropagation() // Prevent event bubbling to overlay
                  handleLanguageChange(language.code)
                }}
                className={cn(
                  "flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                  // Highlight current language
                  currentLang === language.code && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                )}
              >
                {/* Language flag */}
                <span className="text-lg">{language.flag}</span>
                {/* Language name */}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language.name}
                </span>
                {/* Checkmark for current language */}
                {currentLang === language.code && (
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 