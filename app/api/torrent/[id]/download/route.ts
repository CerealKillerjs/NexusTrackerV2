/**
 * POST /api/torrent/[id]/download
 * Download torrent file with personalized announce URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import bencode from 'bencode';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: torrentId } = await params;

    // Get torrent and user passkey
    const [torrent, user] = await Promise.all([
      prisma.torrent.findUnique({
        where: { id: torrentId },
        select: {
          id: true,
          name: true,
          binary: true,
          downloads: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passkey: true },
      }),
    ]);

    if (!torrent) {
      return new NextResponse('Torrent not found', { status: 404 });
    }

    if (!user?.passkey) {
      return new NextResponse('User passkey not found', { status: 400 });
    }

    // Increment download count
    await prisma.torrent.update({
      where: { id: torrentId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    // Convert base64 binary back to buffer
    const torrentBuffer = Buffer.from(torrent.binary, 'base64');
    
    // Decode torrent file
    let torrentData;
    try {
      torrentData = bencode.decode(torrentBuffer);
      console.log('🔍 Torrent decodificado exitosamente');
      console.log('📋 Announce original:', torrentData.announce);
    } catch (error) {
      console.error('Error decoding torrent:', error);
      return new NextResponse('Invalid torrent file', { status: 400 });
    }

    // Determine protocol and domain
    const protocol = request.headers.get('x-forwarded-proto') || 
                    (request.url.startsWith('https') ? 'https' : 'http');
    const host = request.headers.get('host') || 
                 process.env.NEXT_PUBLIC_TRACKER_URL?.replace(/^https?:\/\//, '') || 
                 'localhost:3001';
    
    // Create personalized announce URL
    const announceUrl = `${protocol}://${host}/announce?passkey=${user.passkey}`;
    console.log('🔗 URL de announce generada:', announceUrl);
    
    // Update announce in torrent data
    torrentData.announce = announceUrl;
    console.log('✅ Announce principal actualizado en el torrent');

    // Handle announce-list (multiple trackers)
    if (torrentData['announce-list']) {
      console.log('📋 Announce-list original:', torrentData['announce-list']);
      
      // Create new announce-list with our tracker first, then empty line, then original trackers
      const originalAnnounceList = torrentData['announce-list'];
      const newAnnounceList = [
        [announceUrl], // Our tracker with passkey
        [], // Empty line
        ...originalAnnounceList // Original trackers
      ];
      
      torrentData['announce-list'] = newAnnounceList;
      console.log('✅ Announce-list actualizada con formato correcto');
    } else {
      console.log('ℹ️ No hay announce-list, solo announce principal');
    }

    // Encode modified torrent
    const modifiedBuffer = bencode.encode(torrentData);
    console.log('📦 Torrent re-codificado exitosamente');

    // Return modified torrent file
    return new NextResponse(modifiedBuffer, {
      headers: {
        'Content-Type': 'application/x-bittorrent',
        'Content-Disposition': `attachment; filename="${torrent.name}.torrent"`,
      },
    });
  } catch (error) {
    console.error('Error downloading torrent:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 