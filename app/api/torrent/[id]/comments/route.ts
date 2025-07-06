/**
 * GET /api/torrent/[id]/comments
 * Get comments for a specific torrent
 * 
 * POST /api/torrent/[id]/comments
 * Create a new comment for a torrent
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Comment creation schema
const createCommentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(280, 'El comentario es demasiado largo (máximo 280 caracteres)'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: torrentId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Check if torrent exists
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      select: { id: true },
    });

    if (!torrent) {
      return NextResponse.json(
        { error: 'Torrent no encontrado' },
        { status: 404 }
      );
    }

    // Get comments with user information and vote counts
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { torrentId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.comment.count({ where: { torrentId } }),
    ]);

    // Get user's votes on comments if authenticated
    let userVotes: Record<string, 'up' | 'down'> = {};
    if (session?.user) {
      const votes = await prisma.vote.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: comments.map((c: any) => c.id) },
        },
        select: {
          commentId: true,
          type: true,
        },
      });

      userVotes = votes.reduce((acc: Record<string, 'up' | 'down'>, vote: any) => {
        acc[vote.commentId!] = vote.type as 'up' | 'down';
        return acc;
      }, {} as Record<string, 'up' | 'down'>);
    }

    // Calculate vote counts for each comment
    const commentsWithVotes = await Promise.all(
      comments.map(async (comment: any) => {
        const [upVotes, downVotes] = await Promise.all([
          prisma.vote.count({
            where: {
              commentId: comment.id,
              type: 'up',
            },
          }),
          prisma.vote.count({
            where: {
              commentId: comment.id,
              type: 'down',
            },
          }),
        ]);

        return {
          ...comment,
          userVote: userVotes[comment.id] || null,
          upVotes,
          downVotes,
          score: upVotes - downVotes,
        };
      })
    );

    return NextResponse.json({
      comments: commentsWithVotes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error al cargar los comentarios' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comentar' },
        { status: 401 }
      );
    }

    const { id: torrentId } = await params;
    const body = await request.json();

    // Validate input
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Check if torrent exists
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      select: { id: true },
    });

    if (!torrent) {
      return NextResponse.json(
        { error: 'Torrent no encontrado' },
        { status: 404 }
      );
    }

    // Check user permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role === 'guest') {
      return NextResponse.json(
        { error: 'No tienes permisos para comentar' },
        { status: 403 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        torrentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Comentario creado exitosamente',
      comment: {
        ...comment,
        userVote: null,
        upVotes: 0,
        downVotes: 0,
        score: 0,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Error al crear el comentario' },
      { status: 500 }
    );
  }
} 