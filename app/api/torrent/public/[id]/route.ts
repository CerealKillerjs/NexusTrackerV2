/**
 * GET /api/torrent/public/[id]
 * Public torrent details endpoint - no authentication required
 * Used for public browsing mode to show torrent details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: torrentId } = await params;

    // Get torrent with basic data
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
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
        infoHash: true,
        source: true,
        files: true,
      },
    });

    if (!torrent) {
      return NextResponse.json(
        { error: 'Torrent not found' },
        { status: 404 }
      );
    }

    // Get user info if not anonymous
    let userInfo = null;
    if (!torrent.anonymous) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            torrents: {
              some: {
                id: torrentId
              }
            }
          },
          select: {
            username: true,
          },
        });
        userInfo = user;
      } catch {
        console.log('Could not fetch user info');
      }
    }

    // Parse files from JSON
    let files: { path: string; size: number }[] = [];
    try {
      if (torrent.files && typeof torrent.files === 'object') {
        const filesData = torrent.files as any;
        if (Array.isArray(filesData)) {
          files = filesData.map((file: any) => ({
            path: file.path || file.name || 'Unknown file',
            size: Number(file.size || file.length || 0),
          }));
        }
      }
    } catch (fileError) {
      console.log('Could not parse files JSON');
      files = [];
    }

    // Get counts
    const counts = {
      comments: 0,
      bookmarks: 0,
      votes: 0,
    };

    try {
      const commentCount = await prisma.comment.count({
        where: { torrentId: torrentId },
      });
      counts.comments = commentCount;
    } catch {
      console.log('Could not fetch comment count');
    }

    // Generate magnet link
    const magnetLink = `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodeURIComponent(torrent.name)}`;

    // Format response for public access
    const response = {
      id: torrent.id,
      name: torrent.name,
      description: torrent.description || '',
      type: torrent.type || 'Uncategorized',
      size: Number(torrent.size),
      downloads: torrent.downloads,
      createdAt: torrent.createdAt.toISOString(),
      freeleech: torrent.freeleech,
      tags: torrent.tags,
      anonymous: torrent.anonymous,
      user: userInfo,
      magnet: magnetLink,
      files: files,
      _count: counts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching public torrent details:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 