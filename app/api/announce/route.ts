/**
 * GET /api/announce
 * BitTorrent announce endpoint for tracking peer statistics
 * This endpoint is called by BitTorrent clients to report their status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bencode from 'bencode';

// Toggle for peer list format: 'compact' (production) or 'dictionary' (debug)
const PEER_LIST_FORMAT: 'compact' | 'dictionary' = 'compact';

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

function isIPv6(ip: string) {
  return ip.includes(':');
}

function ipToBuffer(ip: string): Buffer {
  // Handles both IPv4 and IPv6
  if (isIPv6(ip)) {
    // IPv6: 16 bytes
    return Buffer.from(ip.split(':').map(part => parseInt(part, 16)));
  } else {
    // IPv4: 4 bytes
    return Buffer.from(ip.split('.').map(Number));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const passkey = searchParams.get('passkey');
    const peerId = searchParams.get('peer_id');
    const port = searchParams.get('port');
    const uploaded = searchParams.get('uploaded');
    const downloadedParam = searchParams.get('downloaded');
    const left = searchParams.get('left');
    const event = searchParams.get('event');
    const numwant = parseInt(searchParams.get('numwant') || '50', 10);
    const compact = searchParams.get('compact') === '1' || PEER_LIST_FORMAT === 'compact';
    const urlString = request.url;
    const infoHashMatch = urlString.match(/info_hash=([^&]+)/);
    const encodedInfoHash = infoHashMatch ? infoHashMatch[1] : null;
    
    if (!passkey || !encodedInfoHash || !peerId || !port) {
      // Return bencoded failure reason
      const failure = bencode.encode({ 'failure reason': 'Missing required parameters' });
      return new NextResponse(failure, { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    const user = await prisma.user.findFirst({
      where: { passkey },
      select: { id: true, username: true }
    });
    if (!user) {
      const failure = bencode.encode({ 'failure reason': 'Invalid passkey' });
      return new NextResponse(failure, { status: 403, headers: { 'Content-Type': 'text/plain' } });
    }

    const infoHashHex = percentDecodeToBuffer(encodedInfoHash).toString('hex').toLowerCase();
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash: infoHashHex },
      select: { id: true, name: true }
    });
    if (!torrent) {
      const failure = bencode.encode({ 'failure reason': 'Torrent not found' });
      return new NextResponse(failure, { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }

    // Get peer IP address (IPv4 or IPv6)
    let ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      searchParams.get('ip') ||
      '127.0.0.1'; // fallback for local testing

    // Handle announce events
    if (event === 'stopped') {
      await prisma.peer.deleteMany({
        where: {
          peerId,
          torrentId: torrent.id,
        },
      });
    } else if (event === 'completed') {
      // Record a completion event
      await prisma.torrentCompletion.create({
        data: {
          torrentId: torrent.id,
          userId: user.id,
          peerId,
        },
      });
      // Upsert peer info, including 'left'
      await prisma.peer.upsert({
        where: {
          peerId_torrentId: {
            peerId,
            torrentId: torrent.id,
          },
        },
        update: {
          ip,
          port: parseInt(port, 10),
          lastAnnounce: new Date(),
          userId: user.id,
          left: left ? BigInt(left) : BigInt(0),
        },
        create: {
          peerId,
          ip,
          port: parseInt(port, 10),
          torrentId: torrent.id,
          userId: user.id,
          lastAnnounce: new Date(),
          left: left ? BigInt(left) : BigInt(0),
        },
      });
    } else if (event === 'started' || !event) {
      // Upsert peer info, including 'left'
      await prisma.peer.upsert({
        where: {
          peerId_torrentId: {
            peerId,
            torrentId: torrent.id,
          },
        },
        update: {
          ip,
          port: parseInt(port, 10),
          lastAnnounce: new Date(),
          userId: user.id,
          left: left ? BigInt(left) : BigInt(0),
        },
        create: {
          peerId,
          ip,
          port: parseInt(port, 10),
          torrentId: torrent.id,
          userId: user.id,
          lastAnnounce: new Date(),
          left: left ? BigInt(left) : BigInt(0),
        },
      });
    }

    // Clean up old peers (not announced in 45 minutes)
    const cutoff = new Date(Date.now() - 45 * 60 * 1000);
    await prisma.peer.deleteMany({
      where: {
        torrentId: torrent.id,
        lastAnnounce: { lt: cutoff },
      },
    });

    // Get all peers for this torrent
    const allPeers = await prisma.peer.findMany({
      where: { torrentId: torrent.id },
      select: { ip: true, port: true, peerId: true, left: true },
    });

    // Seeder/leecher counting (left == 0 means seeder)
    let complete = 0;
    let incomplete = 0;
    for (const p of allPeers) {
      if (typeof p.left === 'bigint' ? p.left === BigInt(0) : Number(p.left) === 0) {
        complete++;
      } else {
        incomplete++;
      }
    }

    // Peer list for response (exclude self)
    const peers = allPeers.filter(p => p.peerId !== peerId).slice(0, numwant);

    // Get times downloaded (completed)
    const downloaded = await prisma.torrentCompletion.count({
      where: { torrentId: torrent.id },
    });

    let response: any = {
      interval: 1800,
      'min interval': 900,
      complete,
      incomplete,
      downloaded,
    };

    if (compact) {
      // Compact peer list (binary format)
      // IPv4: 6 bytes per peer (4 for IP, 2 for port)
      // IPv6: 18 bytes per peer (16 for IP, 2 for port)
      const peerBuffers: Buffer[] = [];
      for (const p of peers) {
        try {
          const ipBuf = ipToBuffer(p.ip);
          const portBuf = Buffer.alloc(2);
          portBuf.writeUInt16BE(p.port, 0);
          peerBuffers.push(Buffer.concat([ipBuf, portBuf]));
        } catch (e) {
          // Skip invalid IPs
        }
      }
      response.peers = Buffer.concat(peerBuffers);
    } else {
      // Dictionary peer list
      response.peers = peers.map(p => ({
        'peer id': p.peerId,
        ip: p.ip,
        port: p.port,
      }));
    }

    // Tracker stats (optional, for debugging)
    response['tracker id'] = 'NexusTrackerV2';
    response['peers count'] = allPeers.length;

    const bencoded = bencode.encode(response);
    return new NextResponse(bencoded, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Error in announce endpoint:', error);
    const failure = bencode.encode({ 'failure reason': 'Internal server error' });
    return new NextResponse(failure, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
} 