'use client';

import { useBranding } from '@/app/contexts/BrandingContext';

interface BrandingNameProps {
  fallback?: string;
}

export default function BrandingName({ fallback = "NexusTracker V2" }: BrandingNameProps) {
  const { branding, loading } = useBranding();
  
  // Si está cargando o no hay nombre de branding configurado, mostrar el fallback
  if (loading || !branding.BRANDING_NAME) {
    return <>{fallback}</>;
  }
  
  return <>{branding.BRANDING_NAME}</>;
} 