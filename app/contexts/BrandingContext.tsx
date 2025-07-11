'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BrandingConfig {
  BRANDING_NAME?: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  loading: boolean;
  refetch: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>({});
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/config/branding');
      if (!res.ok) return;
      const data = await res.json();
      setBranding({
        BRANDING_NAME: data.config?.BRANDING_NAME,
      });
    } catch {
      // Ignore errors, fallback to defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const refetch = () => {
    setLoading(true);
    fetchBranding();
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, refetch }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
} 