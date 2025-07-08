import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/lib/auth';

// Helper to get configuration
async function getConfig(key: string, fallback: string) {
  const config = await prisma.configuration.findUnique({ where: { key } });
  return config?.value ?? fallback;
}

export async function POST() {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get configuration
    const registrationMode = await getConfig('REGISTRATION_MODE', 'open');
    const inviteExpiryHours = parseInt(await getConfig('INVITE_EXPIRY_HOURS', '6'));

    // Get user with available invitations
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, availableInvites: true }
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Check permissions according to registration mode
    if (registrationMode === 'closed' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'El registro está cerrado' }, { status: 403 });
    }

    // In open mode, only admins can create invitations
    if (registrationMode === 'open' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Las invitaciones solo están disponibles en modo por invitación' }, { status: 403 });
    }

    // In invite_only mode, check available invitations
    if (registrationMode === 'invite_only' && user.role !== 'ADMIN') {
      if (user.availableInvites <= 0) {
        return NextResponse.json({ error: 'No tienes invitaciones disponibles' }, { status: 403 });
      }
    }

    // Generate unique invitation code
    const code = [...Array(8)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + inviteExpiryHours * 60 * 60 * 1000);

    // Create invitation
    const invite = await prisma.inviteCode.create({
      data: {
        code,
        createdBy: user.id,
        expiresAt,
        isActive: true,
      }
    });

    // Reduce available invitations only if not admin and in invite_only mode
    if (user.role !== 'ADMIN' && registrationMode === 'invite_only') {
      await prisma.user.update({
        where: { id: user.id },
        data: { availableInvites: { decrement: 1 } }
      });
    }

    // Generate complete invitation link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/auth/signup?invite=${invite.code}`;

    return NextResponse.json({ 
      code: invite.code, 
      inviteLink: inviteLink,
      expiresAt: invite.expiresAt 
    });
  } catch (error) {
    console.error('Error creando invitación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 