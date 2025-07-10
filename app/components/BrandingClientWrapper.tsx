"use client"
import { ReactNode, useEffect } from "react";
import { BrandingProvider, useBranding } from "../providers/BrandingProvider";

function BrandingHead() {
  const { BRANDING_FAVICON_URL, BRANDING_PRIMARY_COLOR, BRANDING_SECONDARY_COLOR, BRANDING_NAME } = useBranding();
  useEffect(() => {
    // Dynamically set favicon
    if (BRANDING_FAVICON_URL) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = BRANDING_FAVICON_URL;
    }
    // Dynamically set CSS variables for colors
    if (BRANDING_PRIMARY_COLOR) {
      document.documentElement.style.setProperty('--primary', BRANDING_PRIMARY_COLOR);
    }
    if (BRANDING_SECONDARY_COLOR) {
      document.documentElement.style.setProperty('--secondary', BRANDING_SECONDARY_COLOR);
    }
    // Optionally set document title
    if (BRANDING_NAME) {
      document.title = BRANDING_NAME;
    }
  }, [BRANDING_FAVICON_URL, BRANDING_PRIMARY_COLOR, BRANDING_SECONDARY_COLOR, BRANDING_NAME]);
  return null;
}

export default function BrandingClientWrapper({ children }: { children: ReactNode }) {
  return (
    <BrandingProvider>
      <BrandingHead />
      {children}
    </BrandingProvider>
  );
} 