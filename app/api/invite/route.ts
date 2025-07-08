import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/lib/auth';

// Helper para obtener configuración
async function getConfig(key: string, fallback: string) {
  const config = await prisma.configuration.findUnique({ where: { key } });
  return config?.value ?? fallback;
}

export async function POST(request: NextRequest) {
  try {
    // Autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener configuración
    const registrationMode = await getConfig('REGISTRATION_MODE', 'open');
    const inviteExpiryHours = parseInt(await getConfig('INVITE_EXPIRY_HOURS', '6'));

    // Obtener usuario con sus invitaciones disponibles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, availableInvites: true }
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar permisos según modo de registro
    if (registrationMode === 'closed' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'El registro está cerrado' }, { status: 403 });
    }

    // En modo open, solo los admins pueden crear invitaciones
    if (registrationMode === 'open' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Las invitaciones solo están disponibles en modo por invitación' }, { status: 403 });
    }

    // En modo invite_only, verificar invitaciones disponibles
    if (registrationMode === 'invite_only' && user.role !== 'ADMIN') {
      if (user.availableInvites <= 0) {
        return NextResponse.json({ error: 'No tienes invitaciones disponibles' }, { status: 403 });
      }
    }

    // Generar código de invitación único
    const code = [...Array(8)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + inviteExpiryHours * 60 * 60 * 1000);

    // Crear invitación y actualizar contador
    const operations = [
      prisma.inviteCode.create({
        data: {
          code,
          createdBy: user.id,
          expiresAt,
          isActive: true,
        }
      })
    ];

    // Reducir invitaciones disponibles solo si no es admin y está en modo invite_only
    if (user.role !== 'ADMIN' && registrationMode === 'invite_only') {
      operations.push(
        prisma.user.update({
          where: { id: user.id },
          data: { availableInvites: { decrement: 1 } }
        })
      );
    }

    const [invite] = await prisma.$transaction(operations);

    // Generar enlace de invitación completo
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