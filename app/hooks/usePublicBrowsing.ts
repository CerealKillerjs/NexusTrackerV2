/**
 * usePublicBrowsing Hook
 * 
 * Hook to get the public browsing mode configuration
 * Returns whether the site is in public or private mode
 */

import { useState, useEffect } from 'react';

interface PublicBrowsingConfig {
  mode: 'PUBLIC' | 'PRIVATE';
  loading: boolean;
  error: string | null;
}

export function usePublicBrowsing(): PublicBrowsingConfig {
  const [mode, setMode] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/config/public-browsing');
        
        if (!response.ok) {
          throw new Error('Failed to fetch public browsing configuration');
        }

        const data = await response.json();
        setMode(data.mode || 'PUBLIC');
      } catch (err) {
        console.error('Error fetching public browsing config:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Default to public mode on error
        setMode('PUBLIC');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { mode, loading, error };
} 