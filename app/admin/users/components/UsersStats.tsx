/**
 * Users Stats - Server Component
 * 
 * Componente para obtener estadísticas de usuarios desde la base de datos
 */

import { prisma } from '@/app/lib/prisma';

interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  bannedUsers: number;
  admins: number;
  moderators: number;
  regularUsers: number;
}

async function getUsersStats(): Promise<UsersStats> {
  try {
    // Obtener estadísticas generales de usuarios
    const totalUsers = await prisma.user.count();
    
    // Obtener usuarios por estado
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });
    
    const pendingUsers = await prisma.user.count({
      where: { status: 'PENDING' }
    });
    
    const bannedUsers = await prisma.user.count({
      where: { status: 'BANNED' }
    });
    
    // Obtener usuarios por rol
    const admins = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    
    const moderators = await prisma.user.count({
      where: { role: 'MODERATOR' }
    });
    
    const regularUsers = await prisma.user.count({
      where: { role: 'USER' }
    });
    
    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      bannedUsers,
      admins,
      moderators,
      regularUsers
    };
  } catch (error) {
    console.error('Error fetching users stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      bannedUsers: 0,
      admins: 0,
      moderators: 0,
      regularUsers: 0
    };
  }
}

export default getUsersStats; 