"use client"

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useLanguage() {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState<string>('es')

  // Initialize language from localStorage or i18n
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('i18nextLng')
      const initialLang = savedLang || i18n.language || 'es'
      setCurrentLanguage(initialLang)
    }
  }, [])

  // Update when i18n language changes
  useEffect(() => {
    if (i18n.language && i18n.language !== currentLanguage) {
      setCurrentLanguage(i18n.language)
    }
  }, [i18n.language, currentLanguage])

  const changeLanguage = async (languageCode: string) => {
    try {
      console.log('🔄 useLanguage: Changing to', languageCode)
      
      // Update local state immediately
      setCurrentLanguage(languageCode)
      
      // Change i18n language
      await i18n.changeLanguage(languageCode)
      
      console.log('✅ useLanguage: Successfully changed to', languageCode)
      
      // Dispatch custom event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languageChanged', { 
          detail: { language: languageCode } 
        }))
      }
      
      return true
    } catch (error) {
      console.error('❌ useLanguage: Error changing language', error)
      // Revert on error
      setCurrentLanguage(i18n.language || 'es')
      return false
    }
  }

  return {
    currentLanguage,
    changeLanguage,
    isReady: i18n.isInitialized,
    availableLanguages: i18n.languages
  }
} 