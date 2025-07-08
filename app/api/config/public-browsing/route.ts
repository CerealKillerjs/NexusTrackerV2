import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Get public browsing mode from configuration
    const publicBrowsingMode = await prisma.configuration.findUnique({
      where: { key: 'PUBLIC_BROWSING_MODE' }
    });

    return NextResponse.json({
      mode: publicBrowsingMode?.value || 'PUBLIC'
    });

  } catch (error) {
    console.error('Error fetching public browsing mode:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 