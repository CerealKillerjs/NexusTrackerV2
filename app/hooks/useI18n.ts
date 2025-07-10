"use client"

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/app/lib/i18n'

/**
 * Custom hook for handling i18next initialization and preventing hydration mismatches
 * This hook ensures that translations are only used after i18next is fully initialized
 * to prevent server-side rendering (SSR) and client-side hydration mismatches
 */
export function useI18n() {
  // Track whether i18next is ready to use
  const [isReady, setIsReady] = useState(false)
  // Track whether component has mounted on client side
  const [mounted, setMounted] = useState(false)
  // Get translation function from react-i18next
  const { t } = useTranslation()

  useEffect(() => {
    // Mark component as mounted to prevent SSR issues
    setMounted(true)
    
    // Check if i18next is already initialized
    if (i18n.isInitialized) {
      setIsReady(true)
    } else {
      // Wait for initialization if not ready
      const handleInitialized = () => {
        setIsReady(true)
      }
      
      // Listen for initialization event
      i18n.on('initialized', handleInitialized)
      
      // If not initialized, try to initialize manually
      if (!i18n.isInitialized) {
        i18n.init()
      }
      
      // Cleanup event listener on unmount
      return () => {
        i18n.off('initialized', handleInitialized)
      }
    }
  }, [])

  return {
    // Return translation function only if component is mounted and i18next is ready
    // Otherwise return a fallback function that just returns the key
    t: (mounted && isReady) ? t : ((key: string) => key) as typeof t,
    // Only consider ready if both mounted and i18next is initialized
    isReady: mounted && isReady,
    // Track if component has mounted on client
    mounted
  }
} 