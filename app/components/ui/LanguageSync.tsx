/**
 * LanguageSync Component
 * Synchronizes client-side language changes with server-side rendering
 * Updates page content when language changes without full page reload
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import i18n from '@/app/lib/i18n';

interface LanguageSyncProps {
  serverLanguage: string;
}

export function LanguageSync({ serverLanguage }: LanguageSyncProps) {
  const router = useRouter();
  const lastServerLanguage = useRef(serverLanguage);

  useEffect(() => {
    // Sync server language with client
    const currentClientLanguage = i18n.language || 'es';
    
    console.log(`🔄 LanguageSync Debug:`, {
      currentClientLanguage,
      serverLanguage,
      lastServerLanguage: lastServerLanguage.current
    });
    
    // If server language changed (e.g., from navigation), update client
    if (serverLanguage !== lastServerLanguage.current) {
      console.log(`🔄 Server language changed from ${lastServerLanguage.current} to ${serverLanguage}`);
      i18n.changeLanguage(serverLanguage);
      lastServerLanguage.current = serverLanguage;
    }
    // If client and server are out of sync, sync them
    else if (currentClientLanguage !== serverLanguage) {
      console.log(`🔄 Syncing language: client=${currentClientLanguage}, server=${serverLanguage}`);
      i18n.changeLanguage(serverLanguage);
    }

    // Listen for language changes on client
    const handleLanguageChange = (lng: string) => {
      console.log(`🌍 Language changed to: ${lng}`);
      
      // Update the cookie to persist the language choice
      // Use the same cookie name that the server expects
      document.cookie = `i18nextLng=${lng}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Trigger a soft refresh to update server-side content
      // This will re-render the page with new translations
      router.refresh();
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [serverLanguage, router]);

  // Update ref when server language changes
  useEffect(() => {
    lastServerLanguage.current = serverLanguage;
  }, [serverLanguage]);

  // This component doesn't render anything visible
  return null;
} 