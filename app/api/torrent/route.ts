/**
 * GET /api/torrent
 * Get list of torrents with pagination and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (category) {
      where.type = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }
    
    // Build order by clause
    const orderBy: Record<string, unknown> = {};
    orderBy[sortBy] = sortOrder;
    
    // Get torrents with related data
    const [torrents, totalCount] = await Promise.all([
      prisma.torrent.findMany({
        where,
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
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.torrent.count({ where })
    ]);
    
    // Format response
    const formattedTorrents = torrents.map(torrent => ({
      id: torrent.id,
      title: torrent.name,
      category: torrent.type || 'Sin categoría',
      size: formatBytes(Number(torrent.size)),
      seeders: 0, // TODO: Implement seeder/leecher tracking
      leechers: 0, // TODO: Implement seeder/leecher tracking
      uploadedAt: torrent.createdAt.toISOString(),
      uploader: torrent.anonymous ? 'Anónimo' : torrent.user?.username || 'Desconocido',
      downloads: torrent.downloads,
      comments: torrent._count.comments,
      freeleech: torrent.freeleech,
      description: torrent.description || '',
      tags: torrent.tags,
    }));
    
    const response = {
      torrents: formattedTorrents,
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
    console.error('Error fetching torrents:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
} 