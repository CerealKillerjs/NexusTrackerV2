import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        availableInvites: true,
        uploaded: true,
        downloaded: true,
        ratio: true,
        bonusPoints: true,
        _count: {
          select: {
            createdInvites: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calculate hit'n'run count
    const completions = await prisma.torrentCompletion.findMany({ where: { userId: user.id } });
    let hitnrunCount = 0;

    for (const c of completions) {
      // Get the torrent to get the infoHash and size
      const torrent = await prisma.torrent.findUnique({ where: { id: c.torrentId } });
      if (!torrent) continue;

      // Get all progress records for this user and infoHash
      const progresses = await prisma.progress.findMany({ where: { userId: user.id, infoHash: torrent.infoHash } });

      // Aggregate max uploaded/downloaded per peerId
      const progressByPeer = new Map();
      for (const p of progresses) {
        const key = p.peerId;
        const uploaded = Number(p.uploaded ?? 0);
        const downloaded = Number(p.downloaded ?? 0);
        if (!progressByPeer.has(key)) {
          progressByPeer.set(key, { uploaded, downloaded });
        } else {
          const prev = progressByPeer.get(key);
          progressByPeer.set(key, {
            uploaded: Math.max(prev.uploaded, uploaded),
            downloaded: Math.max(prev.downloaded, downloaded),
          });
        }
      }

      // Check for hit-and-run per peer
      for (const { uploaded, downloaded } of progressByPeer.values()) {
        if (downloaded >= Number(torrent.size)) {
          const ratio = uploaded / downloaded;
          if (ratio < 1) {
            hitnrunCount++;
            break; // Only count one hit-and-run per torrentCompletion
          }
        }
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        uploaded: user.uploaded ? Number(user.uploaded) : 0,
        downloaded: user.downloaded ? Number(user.downloaded) : 0,
        ratio: user.ratio,
        bonusPoints: user.bonusPoints,
        createdInvites: user._count.createdInvites,
        hitnrunCount
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 