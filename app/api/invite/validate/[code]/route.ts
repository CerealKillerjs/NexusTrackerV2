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

    // Search for the invitation
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

    // Check if the invitation is active
    if (!invite.isActive) {
      return NextResponse.json({ error: 'Código de invitación inactivo' }, { status: 400 });
    }

    // Check if it was already used
    if (invite.usedBy) {
      return NextResponse.json({ error: 'Código de invitación ya fue utilizado' }, { status: 400 });
    }

    // Check if it expired
    if (invite.expiresAt < now) {
      return NextResponse.json({ error: 'Código de invitación expirado' }, { status: 400 });
    }

    // Get creator information
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