/**
 * GET /api/announce
 * BitTorrent announce endpoint for tracking peer statistics
 * This endpoint is called by BitTorrent clients to report their status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bencode from 'bencode';
import { checkRateLimit, updateRateLimit, getAnnounceConfig } from '@/app/lib/ratelimit';
import { checkAndUpdateRatio } from './ratio';
import { awardBonusPoints } from './bonus';
import { checkAndUpdateHitAndRun, updateHitAndRun } from '@/app/lib/hit-and-run';
import { handleCORS } from '@/app/lib/cors';

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
    const rawPeerId = searchParams.get('peer_id');
    const port = searchParams.get('port');
    const left = searchParams.get('left');
    const event = searchParams.get('event');
    const numwant = parseInt(searchParams.get('numwant') || '50', 10);
    const compact = searchParams.get('compact') === '1' || PEER_LIST_FORMAT === 'compact';
    const urlString = request.url;
    const infoHashMatch = urlString.match(/info_hash=([^&]+)/);
    const encodedInfoHash = infoHashMatch ? infoHashMatch[1] : null;
    
    // Encode peerId to hex to handle binary data safely
    const peerId = rawPeerId ? percentDecodeToBuffer(rawPeerId).toString('hex') : null;
    
    if (!passkey || !encodedInfoHash || !peerId || !port) {
      // Return bencoded failure reason
      const failure = bencode.encode({ 'failure reason': 'Missing required parameters' });
      const errorResponse = new NextResponse(failure, { status: 400, headers: { 'Content-Type': 'text/plain' } });
      return handleCORS(request, errorResponse);
    }

    const user = await prisma.user.findFirst({
      where: { passkey },
      select: { id: true, username: true }
    });
    if (!user) {
      const failure = bencode.encode({ 'failure reason': 'Invalid passkey' });
      const errorResponse = new NextResponse(failure, { status: 403, headers: { 'Content-Type': 'text/plain' } });
      return handleCORS(request, errorResponse);
    }

    const infoHashHex = percentDecodeToBuffer(encodedInfoHash).toString('hex').toLowerCase();
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash: infoHashHex },
      select: { id: true, name: true }
    });
    if (!torrent) {
      const failure = bencode.encode({ 'failure reason': 'Torrent not found' });
      const errorResponse = new NextResponse(failure, { status: 404, headers: { 'Content-Type': 'text/plain' } });
      return handleCORS(request, errorResponse);
    }

    // Get peer IP address (IPv4 or IPv6)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      searchParams.get('ip') ||
      '127.0.0.1';

    // Check rate limiting before processing
    const rateLimitCheck = await checkRateLimit(user.id, torrent.id);
    if (!rateLimitCheck.allowed) {
      const failure = bencode.encode({ 
        'failure reason': 'Rate limit exceeded',
        'retry after': rateLimitCheck.retryAfter
      });
      const errorResponse = new NextResponse(failure, { 
        status: 429, 
        headers: { 
          'Content-Type': 'text/plain',
          'Retry-After': rateLimitCheck.retryAfter.toString()
        } 
      });
      return handleCORS(request, errorResponse);
    }

    // Handle announce events
    const infoHash = percentDecodeToBuffer(encodedInfoHash).toString('hex').toLowerCase();
    const uploaded = Number(searchParams.get('uploaded') || '0');
    const downloadedValue = Number(searchParams.get('downloaded') || '0');
    const leftNum = Number(left || '0');
    // Determine mode
    let mode: string;
    if (Number(leftNum) === 0) {
      mode = 'seeding';
    } else if (uploaded > 0) {
      mode = 'upload';
    } else {
      mode = 'download';
    }

    // Debug: Log incoming announce parameters
    console.log('[ANNOUNCE] Incoming params:', {
      userId: user.id,
      username: user.username,
      infoHash,
      peerId,
      uploaded,
      downloaded: downloadedValue,
      left: leftNum,
      event,
      mode,
      ip,
      port,
    });

    // Calculate uploadDelta as the difference from previous max uploaded for this user/infoHash/peerId
    const prevMaxProgress = await prisma.progress.findFirst({
      where: { userId: user.id, infoHash, peerId },
      orderBy: { updatedAt: 'desc' },
    });
    let uploadDelta = 0;
    let prevLeft = null;
    if (prevMaxProgress) {
      uploadDelta = Math.max(0, uploaded - Number(prevMaxProgress.uploaded ?? 0));
      prevLeft = typeof prevMaxProgress.left === 'bigint' ? Number(prevMaxProgress.left) : Number(prevMaxProgress.left ?? 0);
    } else {
      uploadDelta = uploaded;
      prevLeft = null;
    }

    // Always create a new Progress record for every announce session
    const progressRecord = await prisma.progress.create({
      data: {
        userId: user.id,
        infoHash,
        peerId,
        mode,
        uploaded,
        downloaded: downloadedValue,
        left: BigInt(leftNum),
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
    });
    // Debug: Log the created Progress record
    console.log('[ANNOUNCE] Created Progress record:', progressRecord);

    // Robust completion detection: create TorrentCompletion when left transitions from non-zero to zero
    if ((prevLeft === null || prevLeft > 0) && leftNum === 0) {
      // Prevent duplicate completions for same user/torrent/peerId
      const existingCompletion = await prisma.torrentCompletion.findFirst({
        where: { userId: user.id, torrentId: torrent.id, peerId },
      });
      if (!existingCompletion) {
        await prisma.torrentCompletion.create({
          data: {
            torrentId: torrent.id,
            userId: user.id,
            peerId,
            uploaded,
            downloaded: downloadedValue,
          },
        });
        console.log('[ANNOUNCE] TorrentCompletion created (left=0 transition)', { userId: user.id, torrentId: torrent.id, peerId, uploaded, downloaded: downloadedValue });
      }
    }

    if (event === 'stopped') {
      await prisma.peer.deleteMany({
        where: {
          peerId,
          torrentId: torrent.id,
        },
      });
    } else {
      // Upsert peer info for peer list
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
          uploaded: uploaded,
          downloaded: downloadedValue,
        },
        create: {
          peerId,
          ip,
          port: parseInt(port, 10),
          torrentId: torrent.id,
          userId: user.id,
          lastAnnounce: new Date(),
          left: left ? BigInt(left) : BigInt(0),
          uploaded: uploaded,
          downloaded: downloadedValue,
        },
      });
    }

    // Aggregate Progress for user stats
    // Use the maximum uploaded/downloaded value per (infoHash, peerId)
    const allUserProgress = await prisma.progress.findMany({
      where: { userId: user.id },
      orderBy: [{ infoHash: 'asc' }, { peerId: 'asc' }, { updatedAt: 'desc' }],
    });
    const progressByKey = new Map();
    for (const p of allUserProgress) {
      const key = `${p.infoHash}_${p.peerId}`;
      const uploaded = Number(p.uploaded ?? 0);
      const downloaded = Number(p.downloaded ?? 0);
      if (!progressByKey.has(key)) {
        progressByKey.set(key, { uploaded, downloaded });
      } else {
        const prev = progressByKey.get(key);
        progressByKey.set(key, {
          uploaded: Math.max(prev.uploaded, uploaded),
          downloaded: Math.max(prev.downloaded, downloaded),
        });
      }
    }
    const totalUploaded = Array.from(progressByKey.values()).reduce((sum, p) => sum + p.uploaded, 0);
    const totalDownloaded = Array.from(progressByKey.values()).reduce((sum, p) => sum + p.downloaded, 0);
    const ratio = totalDownloaded === 0 ? 0 : Number((totalUploaded / totalDownloaded).toFixed(2));
    // Debug: Log aggregation results
    console.log('[ANNOUNCE] Aggregated user stats (max per peer):', {
      userId: user.id,
      totalUploaded,
      totalDownloaded,
      ratio,
      progressByKey,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        uploaded: BigInt(totalUploaded),
        downloaded: BigInt(totalDownloaded),
        ratio,
      },
    });

    // Enforce ratio rule (use Progress aggregation)
    const ratioResult = await checkAndUpdateRatio(user.id);
    if (!ratioResult.allowed) {
      const failure = bencode.encode({ 'failure reason': ratioResult.failureReason });
      const errorResponse = new NextResponse(failure, { status: 403, headers: { 'Content-Type': 'text/plain' } });
      return handleCORS(request, errorResponse);
    }

    // Update hit and run tracking based on seeding time
    await updateHitAndRun(user.id, torrent.id, leftNum, event);

    // Enforce hit and run rule (check threshold)
    const hitAndRunResult = await checkAndUpdateHitAndRun(user.id);
    if (!hitAndRunResult.allowed) {
      const failure = bencode.encode({ 'failure reason': hitAndRunResult.failureReason });
      const errorResponse = new NextResponse(failure, { status: 403, headers: { 'Content-Type': 'text/plain' } });
      return handleCORS(request, errorResponse);
    }

    // Award bonus points (use Progress upload delta)
    await awardBonusPoints(user.id, uploadDelta);

    // Update rate limit tracking
    await updateRateLimit(user.id, torrent.id, ip);

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
    // Decode hex peerIds back to binary for client response
    const peers = allPeers
      .filter(p => p.peerId !== peerId) // peerId is already hex, so this comparison works
      .map(p => ({
        ...p,
        peerId: Buffer.from(p.peerId, 'hex').toString('binary')
      }))
      .slice(0, numwant);

    // Get times downloaded (completed)
    const downloaded = await prisma.torrentCompletion.count({
      where: { torrentId: torrent.id },
    });

    // Get configurable intervals
    const config = await getAnnounceConfig();

    const response: Record<string, unknown> = {
      interval: config.interval,
      'min interval': config.minInterval,
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
        } catch {
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
    const nextResponse = new NextResponse(bencoded, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
    
    // Agregar headers de CORS
    return handleCORS(request, nextResponse);
  } catch (error) {
    console.error('Error in announce endpoint:', error);
    const failure = bencode.encode({ 'failure reason': 'Internal server error' });
    const errorResponse = new NextResponse(failure, { status: 500, headers: { 'Content-Type': 'text/plain' } });
    
    // Agregar headers de CORS incluso en caso de error
    return handleCORS(request, errorResponse);
  }
} 