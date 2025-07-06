/**
 * POST /api/torrent/[id]/bookmark
 * Add bookmark to torrent
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: torrentId } = await params;

    // Check if torrent exists
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      select: { id: true },
    });

    if (!torrent) {
      return new NextResponse('Torrent not found', { status: 404 });
    }

    // Create bookmark
    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        torrentId: torrentId,
      },
    });

    return NextResponse.json({ message: 'Bookmark added successfully' });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * DELETE /api/torrent/[id]/bookmark
 * Remove bookmark from torrent
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: torrentId } = await params;

    // Delete bookmark
    await prisma.bookmark.delete({
      where: {
        userId_torrentId: {
          userId: session.user.id,
          torrentId: torrentId,
        },
      },
    });

    return NextResponse.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 