import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import esTranslations from "../locales/es.json"
import enTranslations from "../locales/en.json"

// Define resources
const resources = {
  es: {
    translation: esTranslations
  },
  en: {
    translation: enTranslations
  }
}

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "es",
    lng: "es", // Set default language explicitly
    interpolation: {
      escapeValue: false,
    },
    resources,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
    returnNull: false,
    keySeparator: '.',
    nsSeparator: ':',
    initImmediate: false, // Prevent immediate initialization
  })

// Listen for language changes and save to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng)
  }
})

export default i18n 