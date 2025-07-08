import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Get registration mode from configuration
    const registrationMode = await prisma.configuration.findUnique({
      where: { key: 'REGISTRATION_MODE' }
    });

    return NextResponse.json({
      registrationMode: registrationMode?.value || 'open'
    });

  } catch (error) {
    console.error('Error fetching registration mode:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 