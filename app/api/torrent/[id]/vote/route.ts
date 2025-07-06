/**
 * POST /api/torrent/[id]/vote
 * Vote on torrent (up/down)
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
    const { type } = await request.json();

    if (!type || !['up', 'down'].includes(type)) {
      return new NextResponse('Invalid vote type', { status: 400 });
    }

    // Check if torrent exists
    const torrent = await prisma.torrents.findUnique({
      where: { id: torrentId },
      select: { id: true },
    });

    if (!torrent) {
      return new NextResponse('Torrent not found', { status: 404 });
    }

    // Check if user already voted
    const existingVote = await prisma.votes.findUnique({
      where: {
        userId_torrentId_type: {
          userId: session.user.id,
          torrentId: torrentId,
          type: type,
        },
      },
    });

    if (existingVote) {
      // Remove existing vote (toggle)
      await prisma.votes.delete({
        where: {
          userId_torrentId_type: {
            userId: session.user.id,
            torrentId: torrentId,
            type: type,
          },
        },
      });
      return NextResponse.json({ message: 'Vote removed' });
    }

    // Remove any existing vote of the opposite type
    const oppositeType = type === 'up' ? 'down' : 'up';
    await prisma.votes.deleteMany({
      where: {
        userId: session.user.id,
        torrentId: torrentId,
        type: oppositeType,
      },
    });

    // Create new vote
    await prisma.votes.create({
      data: {
        userId: session.user.id,
        torrentId: torrentId,
        type: type,
      },
    });

    return NextResponse.json({ message: 'Vote added successfully' });
  } catch (error) {
    console.error('Error voting on torrent:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 