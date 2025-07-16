/**
 * Utilidades para manejar la configuración de branding en el servidor
 * Permite obtener la configuración directamente desde la base de datos
 */

import { prisma } from '@/app/lib/prisma';

interface BrandingConfig {
  BRANDING_NAME?: string;
}

/**
 * Obtiene la configuración de branding desde la base de datos
 * @returns La configuración de branding o null si hay un error
 */
export async function getBrandingConfig(): Promise<BrandingConfig | null> {
  try {
    // Obtener la configuración de branding desde la base de datos
    const brandingConfig = await prisma.configuration.findFirst({
      where: {
        key: 'BRANDING_NAME'
      }
    });

    if (!brandingConfig) {
      return null;
    }

    return {
      BRANDING_NAME: brandingConfig.value
    };
  } catch (error) {
    console.error('Error al obtener la configuración de branding:', error);
    return null;
  }
} 