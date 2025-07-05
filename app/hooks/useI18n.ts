"use client"

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/app/lib/i18n'

export function useI18n() {
  const [isReady, setIsReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
    
    // Check if i18next is already initialized
    if (i18n.isInitialized) {
      setIsReady(true)
    } else {
      // Wait for initialization
      const handleInitialized = () => {
        setIsReady(true)
      }
      
      i18n.on('initialized', handleInitialized)
      
      // If not initialized, try to initialize
      if (!i18n.isInitialized) {
        i18n.init()
      }
      
      return () => {
        i18n.off('initialized', handleInitialized)
      }
    }
  }, [])

  return {
    t: (mounted && isReady) ? t : (key: string) => key, // Return key as fallback if not ready
    isReady: mounted && isReady,
    mounted
  }
} 