/**
 * POST /api/torrent/[id]/download
 * Download torrent file
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const torrentId = params.id;

    // Get torrent
    const torrent = await prisma.torrents.findUnique({
      where: { id: torrentId },
      select: {
        id: true,
        name: true,
        binary: true,
        downloads: true,
      },
    });

    if (!torrent) {
      return new NextResponse('Torrent not found', { status: 404 });
    }

    // Increment download count
    await prisma.torrents.update({
      where: { id: torrentId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    // Convert base64 binary back to buffer
    const torrentBuffer = Buffer.from(torrent.binary, 'base64');

    // Return torrent file
    return new NextResponse(torrentBuffer, {
      headers: {
        'Content-Type': 'application/x-bittorrent',
        'Content-Disposition': `attachment; filename="${torrent.name}.torrent"`,
      },
    });
  } catch (error) {
    console.error('Error downloading torrent:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 