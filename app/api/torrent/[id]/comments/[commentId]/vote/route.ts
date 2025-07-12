/**
 * API endpoint to vote on a comment (up/down)
 * POST: Register or remove a vote for a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id: torrentId, commentId } = await params;
    const { type } = await request.json();
    if (!type || !['up', 'down'].includes(type)) {
      return new NextResponse('Invalid vote type', { status: 400 });
    }
    // Check if comment exists and belongs to the torrent
    const comment = await prisma.comment.findFirst({
      where: { id: commentId, torrentId },
      select: { id: true },
    });
    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }
    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId_type: {
          userId: session.user.id,
          commentId,
          type,
        },
      },
    });
    if (existingVote) {
      // Remove existing vote (toggle)
      await prisma.vote.delete({
        where: {
          userId_commentId_type: {
            userId: session.user.id,
            commentId,
            type,
          },
        },
      });
      return NextResponse.json({ message: 'Vote removed' });
    }
    // Remove any existing vote of the opposite type
    const oppositeType = type === 'up' ? 'down' : 'up';
    await prisma.vote.deleteMany({
      where: {
        userId: session.user.id,
        commentId,
        type: oppositeType,
      },
    });
    // Create new vote
    await prisma.vote.create({
      data: {
        userId: session.user.id,
        commentId,
        type,
      },
    });
    return NextResponse.json({ message: 'Vote registered' });
  } catch (error) {
    console.error('Vote error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 