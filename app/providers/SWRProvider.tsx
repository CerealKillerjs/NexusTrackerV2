/**
 * SWR Provider Component
 * 
 * Configures global SWR settings for optimal caching behavior:
 * - Disables revalidation on focus to prevent unnecessary requests
 * - Disables revalidation on reconnect to maintain cache
 * - Sets deduping interval to prevent duplicate requests
 * - Configures error retry behavior
 */

'use client';

import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Disable revalidation on focus to prevent unnecessary requests
        revalidateOnFocus: false,
        
        // Disable revalidation on reconnect to maintain cache
        revalidateOnReconnect: false,
        
        // Deduplicate requests within 60 seconds
        dedupingInterval: 60000,
        
        // Retry failed requests up to 3 times
        errorRetryCount: 3,
        
        // Retry interval increases exponentially
        errorRetryInterval: 1000,
        
        // Custom fetcher function
        fetcher: async (url: string) => {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return response.json();
        },
        
        // Global error handler
        onError: (error, key) => {
          console.error('SWR Error:', error, 'for key:', key);
        },
        
        // Global success handler
        onSuccess: (data, key) => {
          console.log('SWR Success for key:', key);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
} 