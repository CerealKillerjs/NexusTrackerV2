import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/lib/auth';
import { validateInviteLimit } from '@/app/lib/invite-limits';

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verify that it's an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, invites } = body;

    if (!userId || typeof invites !== 'number' || invites < 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Verify that the user exists and get their current information
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, availableInvites: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Validate invitation limit
    const validation = await validateInviteLimit(
      targetUser.availableInvites,
      invites,
      targetUser.role
    );

    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error,
        maxAllowed: validation.maxAllowed
      }, { status: 400 });
    }

    // Update available invitations
    await prisma.user.update({
      where: { id: userId },
      data: { availableInvites: invites }
    });

    return NextResponse.json({
      message: `Se asignaron ${invites} invitaciones a ${targetUser.username}`,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        availableInvites: invites,
        maxAllowed: validation.maxAllowed
      }
    });

  } catch (error) {
    console.error('Error asignando invitaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 