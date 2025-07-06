/**
 * GET /api/torrent/[id]
 * Get detailed torrent information by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// Function to decode file paths properly
function decodeFilePaths(files: unknown[]): Array<{ path: string; size: number }> {
  return files.map(file => {
    const fileObj = file as { path: unknown; size: number };
    let path = fileObj.path;
    const size = fileObj.size;

    // If path is an array of numbers (bytes), convert to string
    if (Array.isArray(path)) {
      path = path.map((p: unknown) => {
        if (typeof p === 'number') {
          return String.fromCharCode(p);
        } else if (Buffer.isBuffer(p)) {
          return p.toString('utf8');
        } else {
          return String(p);
        }
      }).join('/');
    } else if (typeof path === 'string') {
      // If it's already a string, check if it contains byte values
      if (path.includes(',')) {
        try {
          const bytes = path.split(',').map(b => parseInt(b.trim()));
          path = bytes.map(b => String.fromCharCode(b)).join('');
        } catch {
          // If conversion fails, keep original path
          console.warn('Failed to decode path:', path);
        }
      }
    }

    return {
      path: String(path) || 'unknown',
      size: size || 0
    };
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: torrentId } = await params;

    // Get torrent with related data
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      include: {
        user: {
          select: {
            username: true,
            ratio: true,
            uploaded: true,
            downloaded: true,
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
    });

    if (!torrent) {
      return NextResponse.json(
        { error: 'Torrent no encontrado' },
        { status: 404 }
      );
    }

    // Get user's vote and bookmark status if authenticated
    let userVote: 'up' | 'down' | null = null;
    let isBookmarked = false;

    if (session?.user?.id) {
      // Get user's vote
      const vote = await prisma.vote.findUnique({
        where: {
          userId_torrentId_type: {
            userId: session.user.id,
            torrentId: torrentId,
            type: 'up',
          },
        },
      });

      if (vote) {
        userVote = 'up';
      } else {
        const downVote = await prisma.vote.findUnique({
          where: {
            userId_torrentId_type: {
              userId: session.user.id,
              torrentId: torrentId,
              type: 'down',
            },
          },
        });
        if (downVote) {
          userVote = 'down';
        }
      }

      // Get bookmark status
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_torrentId: {
            userId: session.user.id,
            torrentId: torrentId,
          },
        },
      });
      isBookmarked = !!bookmark;
    }

    // Parse and decode files JSON
    const rawFiles = Array.isArray(torrent.files) ? torrent.files : [];
    const files = decodeFilePaths(rawFiles);

    // Format response
    const response = {
      id: torrent.id,
      name: torrent.name,
      description: torrent.description || '',
      type: torrent.type || '',
      source: torrent.source || '',
      size: Number(torrent.size),
      files: files,
      uploadedBy: torrent.uploadedBy,
      downloads: torrent.downloads,
      createdAt: torrent.createdAt.toISOString(),
      freeleech: torrent.freeleech,
      tags: torrent.tags,
      anonymous: torrent.anonymous,
      image: torrent.image || undefined,
      nfo: torrent.nfo || undefined,
      user: torrent.anonymous ? undefined : (torrent.user ? {
        username: torrent.user.username,
        ratio: Number(torrent.user.ratio),
        uploaded: Number(torrent.user.uploaded),
        downloaded: Number(torrent.user.downloaded),
      } : undefined),
      _count: torrent._count,
      userVote,
      isBookmarked,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching torrent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 