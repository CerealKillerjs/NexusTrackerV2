/**
 * GET /api/torrent/public/[id]/download
 * Public torrent file download endpoint - no authentication required
 * Generates and returns a .torrent file for the specified torrent
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: torrentId } = await params;

    // Get torrent data and branding configuration
    const [torrent, brandingConfig] = await Promise.all([
      prisma.torrent.findUnique({
        where: { id: torrentId },
        select: {
          id: true,
          name: true,
          infoHash: true,
          size: true,
          files: true,
        },
      }),
      prisma.configuration.findUnique({
        where: { key: 'BRANDING_NAME' },
        select: { value: true },
      }),
    ]);

    if (!torrent) {
      return NextResponse.json(
        { error: 'Torrent not found' },
        { status: 404 }
      );
    }

    // Parse files JSON and ensure correct type
    let files: Array<{ name: string; size: number }> = [];
    if (Array.isArray(torrent.files)) {
      files = torrent.files.filter((f): f is { name: string; size: number } => {
        if (!f || typeof f !== 'object' || Array.isArray(f)) return false;
        const obj = f as Record<string, unknown>;
        return typeof obj.name === 'string' && typeof obj.size === 'number';
      });
    }

    // Generate .torrent file content
    const torrentContent = generateTorrentFile({ ...torrent, files });

    // Create filename with branding name
    const brandingName = brandingConfig?.value || 'NexusTracker';
    const filename = `${torrent.name} - ${brandingName}.torrent`;

    // Return the .torrent file
    return new NextResponse(torrentContent, {
      headers: {
        'Content-Type': 'application/x-bittorrent',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating torrent file:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Generate .torrent file content
function generateTorrentFile(torrent: {
  name: string;
  files: Array<{ name: string; size: number }>;
}): string {
  // This is a simplified .torrent file generation
  // In a real implementation, you would generate a proper .torrent file
  // For now, we'll create a basic structure
  
  const torrentData = {
    info: {
      name: torrent.name,
      piece_length: 262144, // 256KB pieces
      pieces: '', // Would contain piece hashes
      files: torrent.files.map((file) => ({
        length: file.size,
        path: [file.name],
      })),
    },
    announce: 'https://your-tracker.com/announce', // Replace with your tracker URL
    created_by: 'NexusTracker V2',
    creation_date: Math.floor(Date.now() / 1000),
  };

  // Convert to bencode format (simplified)
  return bencode(torrentData);
}

// Simple bencode implementation
function bencode(obj: unknown): string {
  if (typeof obj === 'string') {
    return obj.length + ':' + obj;
  }
  if (typeof obj === 'number') {
    return 'i' + obj + 'e';
  }
  if (Array.isArray(obj)) {
    let result = 'l';
    for (const item of obj) {
      result += bencode(item);
    }
    return result + 'e';
  }
  if (obj && typeof obj === 'object') {
    let result = 'd';
    const keys = Object.keys(obj as object).sort();
    for (const key of keys) {
      result += bencode(key) + bencode((obj as Record<string, unknown>)[key]);
    }
    return result + 'e';
  }
  return '';
} 