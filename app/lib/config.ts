/**
 * Configuration utilities for server-side operations
 * Direct database access without HTTP overhead
 */

import { prisma } from './prisma';

/**
 * Get registration mode directly from database
 * Used in Server Components to avoid HTTP fetch overhead
 */
export async function getRegistrationMode(): Promise<string> {
  try {
    const registrationMode = await prisma.configuration.findUnique({
      where: { key: 'REGISTRATION_MODE' }
    });
    
    return registrationMode?.value || 'open';
  } catch (error) {
    console.error('Error fetching registration mode:', error);
    return 'open'; // fallback
  }
}

/**
 * Get branding configuration directly from database
 * Used in Server Components to avoid HTTP fetch overhead
 */
export async function getBrandingConfig() {
  try {
    const branding = await prisma.configuration.findUnique({
      where: { key: 'BRANDING' }
    });
    
    return branding?.value ? JSON.parse(branding.value) : null;
  } catch (error) {
    console.error('Error fetching branding config:', error);
    return null;
  }
} 