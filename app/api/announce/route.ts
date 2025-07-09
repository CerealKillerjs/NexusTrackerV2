/**
 * GET /api/announce
 * BitTorrent announce endpoint for tracking peer statistics
 * This endpoint is called by BitTorrent clients to report their status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * Decodes a percent-encoded string to a Buffer
 * @param encoded - The percent-encoded string
 * @returns Buffer containing the decoded bytes
 */
function percentDecodeToBuffer(encoded: string): Buffer {
  const bytes = [];
  for (let i = 0; i < encoded.length; ) {
    if (encoded[i] === '%') {
      bytes.push(parseInt(encoded.substr(i + 1, 2), 16));
      i += 3;
    } else {
      bytes.push(encoded.charCodeAt(i));
      i += 1;
    }
  }
  return Buffer.from(bytes);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract BitTorrent announce parameters
    const passkey = searchParams.get('passkey');
    const peerId = searchParams.get('peer_id');
    const port = searchParams.get('port');
    const uploaded = searchParams.get('uploaded');
    const downloaded = searchParams.get('downloaded');
    const left = searchParams.get('left');
    const event = searchParams.get('event'); // started, stopped, completed
    
    // Extract info_hash directly from URL string to avoid automatic UTF-8 decoding
    const urlString = request.url;
    const infoHashMatch = urlString.match(/info_hash=([^&]+)/);
    const encodedInfoHash = infoHashMatch ? infoHashMatch[1] : null;
    
    // Validate required parameters
    if (!passkey || !encodedInfoHash || !peerId || !port) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Find user by passkey
    const user = await prisma.user.findFirst({
      where: { passkey },
      select: { id: true, username: true }
    });

    if (!user) {
      return new NextResponse('Invalid passkey', { status: 403 });
    }

    // Decode info_hash from percent-encoded to hex
    const infoHashHex = percentDecodeToBuffer(encodedInfoHash).toString('hex').toLowerCase();

    // Find torrent by info hash (hex)
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash: infoHashHex },
      select: { id: true, name: true }
    });

    if (!torrent) {
      return new NextResponse('Torrent not found', { status: 404 });
    }

    // TODO: Implement peer tracking logic
    // This is where you would:
    // 1. Store/update peer information in the database
    // 2. Calculate and update user statistics (uploaded, downloaded, ratio)
    // 3. Return peer list to the client
    
    console.log('Announce request:', {
      user: user.username,
      torrent: torrent.name,
      event,
      uploaded,
      downloaded,
      left
    });

    // For now, return a basic response
    // In a real implementation, you would return a bencoded response with peer information
    const response = {
      interval: 1800, // 30 minutes
      min_interval: 900, // 15 minutes
      complete: 0,
      incomplete: 0,
      peers: [] // Empty for now, would contain peer list in real implementation
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in announce endpoint:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 