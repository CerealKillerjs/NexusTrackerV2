import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    // Search for the invitation
    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        creator: {
          select: { username: true }
        }
      }
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

    // Check registration mode
    const registrationMode = await prisma.configuration.findUnique({
      where: { key: 'REGISTRATION_MODE' }
    });

    if (registrationMode?.value === 'closed') {
      return NextResponse.json({ error: 'El registro está cerrado' }, { status: 403 });
    }

    if (registrationMode?.value !== 'invite_only') {
      return NextResponse.json({ error: 'El registro no requiere invitación en este momento' }, { status: 400 });
    }

    // The invitation is valid
    return NextResponse.json({ 
      valid: true,
      createdBy: invite.creator.username,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt
    });

  } catch (error) {
    console.error('Error validando invitación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 