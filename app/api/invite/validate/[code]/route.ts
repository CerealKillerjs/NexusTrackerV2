import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    if (!code) {
      return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    // Buscar la invitación
    const invite = await prisma.inviteCode.findUnique({
      where: { code },
      select: {
        id: true,
        isActive: true,
        usedBy: true,
        expiresAt: true,
        createdBy: true
      }
    });

    if (!invite) {
      return NextResponse.json({ error: 'Código de invitación no encontrado' }, { status: 404 });
    }

    const now = new Date();

    // Verificar si la invitación está activa
    if (!invite.isActive) {
      return NextResponse.json({ error: 'Código de invitación inactivo' }, { status: 400 });
    }

    // Verificar si ya fue usada
    if (invite.usedBy) {
      return NextResponse.json({ error: 'Código de invitación ya fue utilizado' }, { status: 400 });
    }

    // Verificar si expiró
    if (invite.expiresAt < now) {
      return NextResponse.json({ error: 'Código de invitación expirado' }, { status: 400 });
    }

    // Obtener información del creador
    const creator = await prisma.user.findUnique({
      where: { id: invite.createdBy },
      select: { username: true }
    });

    return NextResponse.json({
      valid: true,
      expiresAt: invite.expiresAt,
      createdBy: creator?.username || 'Usuario'
    });

  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 