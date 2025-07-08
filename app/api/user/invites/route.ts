import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get active invites for the current user
    const invites = await prisma.inviteCode.findMany({
      where: {
        createdBy: session.user.id,
        isActive: true,
        usedBy: null, // Not used yet
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        code: true,
        createdAt: true,
        expiresAt: true,
        isActive: true
      }
    });

    return NextResponse.json({
      invites: invites.map(invite => ({
        ...invite,
        inviteLink: `${process.env.NEXTAUTH_URL}/auth/signup?code=${invite.code}`
      }))
    });

  } catch (error) {
    console.error('Error fetching user invites:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel an invite
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json(
        { error: 'ID de invitación requerido' },
        { status: 400 }
      );
    }

    // Verify the invite belongs to the current user and is not used
    const invite = await prisma.inviteCode.findFirst({
      where: {
        id: inviteId,
        createdBy: session.user.id,
        usedBy: null,
        isActive: true
      }
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitación no encontrada o no puede ser cancelada' },
        { status: 404 }
      );
    }

    // Deactivate the invite
    await prisma.inviteCode.update({
      where: { id: inviteId },
      data: { isActive: false }
    });

    // Return the invite to the user's available invites
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        availableInvites: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      message: 'Invitación cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error canceling invite:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 