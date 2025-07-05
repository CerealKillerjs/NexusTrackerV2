import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import esTranslations from "../locales/es.json"
import enTranslations from "../locales/en.json"

// Define translation resources for different languages
// Each language has its own translation namespace with all UI text
const resources = {
  es: {
    translation: esTranslations
  },
  en: {
    translation: enTranslations
  }
}

// Initialize i18next with configuration for internationalization
i18n
  .use(LanguageDetector) // Automatically detect user's preferred language
  .use(initReactI18next) // Initialize React i18next integration
  .init({
    debug: false, // Disable debug mode in production
    fallbackLng: "es", // Default language if detection fails
    lng: "es", // Set explicit default language
    interpolation: {
      escapeValue: false, // Don't escape HTML in translations
    },
    resources, // Load translation resources
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'], // Detection order: localStorage first, then browser, then HTML
      caches: ['localStorage'], // Cache detected language in localStorage
      lookupLocalStorage: 'i18nextLng', // Key used in localStorage
    },
    react: {
      useSuspense: false, // Disable Suspense to prevent SSR issues
    },
    returnNull: false, // Return empty string instead of null for missing keys
    keySeparator: '.', // Use dots for nested translation keys
    nsSeparator: ':', // Use colons for namespace separation
    initImmediate: false, // Prevent immediate initialization to avoid SSR issues
  })

// Listen for language changes and automatically save to localStorage
// This ensures the selected language persists across browser sessions
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng)
  }
})

export default i18n 