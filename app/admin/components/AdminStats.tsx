/**
 * Admin Stats - Server Component
 * 
 * Componente para obtener estadísticas reales de la base de datos
 * para el panel de administración
 */

import { prisma } from '@/app/lib/prisma';

interface AdminStats {
  totalUsers: number;
  totalTorrents: number;
  totalAdmins: number;
  systemStatus: string;
}

async function getAdminStats(): Promise<AdminStats> {
  try {
    // Obtener estadísticas de usuarios
    const totalUsers = await prisma.user.count();
    
    // Obtener estadísticas de torrents
    const totalTorrents = await prisma.torrent.count();
    
    // Obtener estadísticas de administradores
    const totalAdmins = await prisma.user.count({
      where: {
        role: 'ADMIN'
      }
    });
    
    // Verificar estado del sistema (por ahora siempre OK)
    const systemStatus = 'OK';
    
    return {
      totalUsers,
      totalTorrents,
      totalAdmins,
      systemStatus
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalTorrents: 0,
      totalAdmins: 0,
      systemStatus: 'Error'
    };
  }
}

export default getAdminStats; 