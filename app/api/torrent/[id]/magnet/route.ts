/**
 * Magnet Link Generation Endpoint
 * 
 * Generates magnet links for torrents with the following format:
 * magnet:?xt=urn:btih:INFO_HASH&dn=TORRENT_NAME&tr=ANNOUNCE_URL&tr=TRACKER2&tr=TRACKER3...
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

    // Get torrent data
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      select: {
        id: true,
        name: true,
        infoHash: true,
        binary: true,
      },
    });

    if (!torrent) {
      return new NextResponse('Torrent not found', { status: 404 });
    }

    if (!torrent.infoHash) {
      return new NextResponse('Torrent info hash not available', { status: 400 });
    }

    // Get user's passkey for the announce URL
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passkey: true },
    });

    if (!user?.passkey) {
      return new NextResponse('User passkey not available', { status: 400 });
    }

    // Get the current domain and protocol
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create announce URL with passkey
    const announceUrl = `${baseUrl}/api/announce?passkey=${user.passkey}`;

    // Get all trackers from the original torrent file
    const torrentBuffer = Buffer.from(torrent.binary, 'base64');
    let torrentData;
    const allTrackers = [announceUrl]; // Start with our tracker

    console.log('🔍 Decodificando torrent para magnet link...');
    console.log('📋 Nuestro tracker:', announceUrl);

    try {
      torrentData = bencode.decode(torrentBuffer);
      console.log('✅ Torrent decodificado exitosamente');
      console.log('📋 Announce original:', torrentData.announce);
      console.log('📋 Announce-list original:', torrentData['announce-list']);
      
      // Add the original announce if it exists
      if (torrentData.announce) {
        const announceStr = Buffer.isBuffer(torrentData.announce) || torrentData.announce instanceof Uint8Array
          ? Buffer.from(torrentData.announce).toString('utf8')
          : String(torrentData.announce);
        if (!allTrackers.includes(announceStr)) {
          allTrackers.push(announceStr);
          console.log('✅ Agregado announce original:', announceStr);
        }
      }

      // Add all trackers from announce-list if it exists
      if (torrentData['announce-list']) {
        console.log('\ud83d\udccb Procesando announce-list...');
        (torrentData['announce-list'] as unknown as unknown[][]).forEach((trackerGroup, index) => {
          console.log(`\ud83d\udccb Grupo ${index}:`, trackerGroup);
          if (Array.isArray(trackerGroup)) {
            trackerGroup.forEach((tracker) => {
              const trackerStr = Buffer.isBuffer(tracker) || tracker instanceof Uint8Array
                ? Buffer.from(tracker).toString('utf8')
                : String(tracker);
              if (trackerStr && !allTrackers.includes(trackerStr)) {
                allTrackers.push(trackerStr);
                console.log('\u2705 Agregado tracker:', trackerStr);
              }
            });
          }
        });
      }
      
      console.log('📋 Trackers finales:', allTrackers);
    } catch (error) {
      console.error('❌ Error decoding torrent for magnet:', error);
      // If we can't decode the torrent, just use our tracker
    }

    // Encode torrent name for URL
    const encodedName = encodeURIComponent(torrent.name);

    // Generate magnet link with all trackers
    const trackerParams = allTrackers.map(tracker => `tr=${encodeURIComponent(tracker)}`).join('&');
    const magnetLink = `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodedName}&${trackerParams}`;

    return NextResponse.json({
      magnetLink,
      infoHash: torrent.infoHash,
      name: torrent.name,
      trackers: allTrackers,
    });

  } catch (error) {
    console.error('Magnet link generation error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 