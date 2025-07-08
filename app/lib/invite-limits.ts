import { prisma } from './prisma';

/**
 * Gets the maximum invitation limit per user from configuration
 * @returns The maximum invitation limit (default 5)
 */
export async function getMaxInvitesPerUser(): Promise<number> {
  try {
    const config = await prisma.configuration.findUnique({
      where: { key: 'MAX_INVITES_PER_USER' }
    });
    
    return config ? parseInt(config.value, 10) : 5;
  } catch (error) {
    console.error('Error getting max invites per user:', error);
    return 5; // Default value
  }
}

/**
 * Validates if a user can have the specified number of invitations
 * @param currentInvites - User's current invitations
 * @param newInvites - New invitations to assign
 * @param userRole - User's role
 * @returns true if valid, false if exceeds limit
 */
export async function validateInviteLimit(
  currentInvites: number, 
  newInvites: number, 
  userRole: string
): Promise<{ valid: boolean; maxAllowed: number; error?: string }> {
  // Admins can have unlimited invitations
  if (userRole === 'ADMIN') {
    return { valid: true, maxAllowed: Infinity };
  }

  const maxInvites = await getMaxInvitesPerUser();
  
  if (newInvites > maxInvites) {
    return {
      valid: false,
      maxAllowed: maxInvites,
      error: `No se pueden asignar más de ${maxInvites} invitaciones por usuario`
    };
  }

  return { valid: true, maxAllowed: maxInvites };
}

/**
 * Gets information about invitation limits for a user
 * @param userRole - User's role
 * @returns Information about limits
 */
export async function getInviteLimitInfo(userRole: string): Promise<{
  maxAllowed: number;
  isUnlimited: boolean;
  description: string;
}> {
  if (userRole === 'ADMIN') {
    return {
      maxAllowed: Infinity,
      isUnlimited: true,
      description: 'Invitaciones ilimitadas'
    };
  }

  const maxInvites = await getMaxInvitesPerUser();
  return {
    maxAllowed: maxInvites,
    isUnlimited: false,
    description: `Máximo ${maxInvites} invitaciones por usuario`
  };
} 