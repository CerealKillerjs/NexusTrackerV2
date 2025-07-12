/**
 * GET /api/user/bookmarks
 * Get user's bookmarked torrents with pagination and sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build order by clause
    const orderBy: Record<string, unknown> = {};
    orderBy[sortBy] = sortOrder;
    
    // Get user's bookmarks with torrent data
    const [bookmarks, totalCount] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          torrent: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  bookmarks: true,
                  votes: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.bookmark.count({
        where: {
          userId: session.user.id,
        },
      })
    ]);

    // Format response
    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.id,
      createdAt: bookmark.createdAt.toISOString(),
      torrent: {
        id: bookmark.torrent.id,
        title: bookmark.torrent.name,
        category: bookmark.torrent.type || 'Sin categoría',
        size: bookmark.torrent.size.toString(),
        seeders: 0, // TODO: Implement seeder/leecher tracking
        leechers: 0, // TODO: Implement seeder/leecher tracking
        uploadedAt: bookmark.torrent.createdAt.toISOString(),
        uploader: bookmark.torrent.anonymous ? 'Anónimo' : bookmark.torrent.user?.username || 'Desconocido',
        downloads: bookmark.torrent.downloads,
        comments: bookmark.torrent._count.comments,
        freeleech: bookmark.torrent.freeleech,
        description: bookmark.torrent.description || '',
        tags: bookmark.torrent.tags,
      },
    }));

    const response = {
      bookmarks: formattedBookmarks,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 