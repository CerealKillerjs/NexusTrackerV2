import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/lib/auth';
import { getUserHitAndRunStats } from '@/app/lib/hit-and-run';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Get hit and run statistics using the new system
    let hitAndRunStats;
    try {
      hitAndRunStats = await getUserHitAndRunStats(user.id);
    } catch (error) {
      console.error('Error getting hit and run stats:', error);
      // Fallback a valores por defecto si hay error
      hitAndRunStats = {
        totalHitAndRuns: 0,
        activeHitAndRuns: 0,
        totalSeedingTime: 0,
        requiredSeedingTime: 4320 // 72 horas por defecto
      };
    }

    return NextResponse.json({
      user: {
        ...user,
        uploaded: user.uploaded ? Number(user.uploaded) : 0,
        downloaded: user.downloaded ? Number(user.downloaded) : 0,
        ratio: user.ratio,
        bonusPoints: user.bonusPoints,
        createdInvites: user._count.createdInvites,
        // Mantener compatibilidad con el frontend existente
        hitnrunCount: hitAndRunStats.activeHitAndRuns,
        // También incluir las estadísticas completas para uso futuro
        hitAndRunStats
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 