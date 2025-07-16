import { prisma } from '@/app/lib/prisma';

/**
 * Obtiene las estadísticas de un usuario desde la base de datos
 * @param userId ID del usuario
 * @returns Estadísticas del usuario o null si no se encuentra
 */
export async function getUserStats(userId?: string) {
  if (!userId) return null;
  
  try {
    // Obtener información del usuario con estadísticas agregadas
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        availableInvites: true,
        uploaded: true,
        downloaded: true,
        ratio: true,
        bonusPoints: true,
        _count: {
          select: {
            createdInvites: true
          }
        }
      }
    });

    // Obtener conteo de Hit & Run
    const completions = await prisma.torrentCompletion.findMany({
      where: { userId }
    });
    
    const hitnrunCount = completions.length || 0;

    if (user) {
      return {
        ...user,
        hitnrunCount,
        createdInvitesCount: user._count.createdInvites
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener estadísticas de usuario:', error);
    return null;
  }
} 