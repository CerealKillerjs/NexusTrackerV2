"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface BrandingConfig {
  BRANDING_NAME?: string;
  BRANDING_LOGO_URL?: string;
  BRANDING_FAVICON_URL?: string;
  BRANDING_PRIMARY_COLOR?: string;
  BRANDING_SECONDARY_COLOR?: string;
}

const BrandingContext = createContext<BrandingConfig>({});

export function useBranding() {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>({});

  useEffect(() => {
    async function fetchBranding() {
      try {
        const res = await fetch('/api/config/branding');
        if (!res.ok) return;
        const data = await res.json();
        setBranding({
          BRANDING_NAME: data.config?.BRANDING_NAME,
          BRANDING_LOGO_URL: data.config?.BRANDING_LOGO_URL,
          BRANDING_FAVICON_URL: data.config?.BRANDING_FAVICON_URL,
          BRANDING_PRIMARY_COLOR: data.config?.BRANDING_PRIMARY_COLOR,
          BRANDING_SECONDARY_COLOR: data.config?.BRANDING_SECONDARY_COLOR,
        });
      } catch {
        // Ignore errors, fallback to defaults
      }
    }
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
} 