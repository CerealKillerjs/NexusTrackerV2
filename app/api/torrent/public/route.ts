/**
 * GET /api/torrent/public
 * Public torrent search endpoint - no authentication required
 * Used for public browsing mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Filtering parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
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
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Get torrents with related data (limited info for public access)
    const [torrents, totalCount] = await Promise.all([
      prisma.torrent.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          size: true,
          downloads: true,
          createdAt: true,
          freeleech: true,
          tags: true,
          anonymous: true,
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
    
    // Format response for public access
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
    console.error('Error fetching public torrents:', error);
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