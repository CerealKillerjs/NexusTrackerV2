import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Search for the invitation
    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!invite) {
      return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 404 });
    }

    // Check if it was already used
    if (invite.usedBy) {
      return NextResponse.json({ error: 'Esta invitación ya ha sido utilizada' }, { status: 400 });
    }

    // Check if it's active
    if (!invite.isActive) {
      return NextResponse.json({ error: 'Esta invitación ha sido desactivada' }, { status: 400 });
    }

    // Check if it has expired
    const now = new Date();
    if (invite.expiresAt < now) {
      return NextResponse.json({ error: 'Esta invitación ha expirado' }, { status: 400 });
    }

    // Verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Consume the invitation (mark as used)
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: {
        usedBy: userId,
        usedAt: now
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Invitación consumida exitosamente'
    });

  } catch (error) {
    console.error('Error consumiendo invitación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 