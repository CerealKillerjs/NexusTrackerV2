/**
 * GET /api/torrent/tags/popular
 * Get the most popular tags from all torrents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // Get all torrents with their tags
    const torrents = await prisma.torrent.findMany({
      select: {
        tags: true,
      },
    });
    
    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    
    torrents.forEach(torrent => {
      if (torrent.tags && Array.isArray(torrent.tags)) {
        torrent.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            const normalizedTag = tag.trim().toLowerCase();
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
          }
        });
      }
    });
    
    // Convert to array and sort by count
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ tag, count }) => ({
        name: tag,
        count,
        // Calculate font size based on count (min: 0.8, max: 2.5)
        fontSize: Math.max(0.8, Math.min(2.5, 0.8 + (count / Math.max(...Object.values(tagCounts))) * 1.7))
      }));
    
    return NextResponse.json({
      tags: popularTags,
      total: Object.keys(tagCounts).length
    });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 