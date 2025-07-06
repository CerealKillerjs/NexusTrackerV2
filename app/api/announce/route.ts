/**
 * GET /api/announce
 * BitTorrent announce endpoint for tracking peer statistics
 * This endpoint is called by BitTorrent clients to report their status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract BitTorrent announce parameters
    const passkey = searchParams.get('passkey');
    const infoHash = searchParams.get('info_hash');
    const peerId = searchParams.get('peer_id');
    const port = searchParams.get('port');
    const uploaded = searchParams.get('uploaded');
    const downloaded = searchParams.get('downloaded');
    const left = searchParams.get('left');
    const event = searchParams.get('event'); // started, stopped, completed
    
    // Validate required parameters
    if (!passkey || !infoHash || !peerId || !port) {
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

    // Find torrent by info hash
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
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