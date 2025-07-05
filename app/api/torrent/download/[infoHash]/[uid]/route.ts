import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Download API Route (Public)
 *
 * This file handles downloading a torrent file by info hash and user UID (for announce URLs).
 *
 * Features:
 * - Download torrent file (bencoded)
 * - No authentication required
 * - Increments download count
 * - Handles protected torrents (TODO)
 *
 * Authentication:
 * - Public route
 */

/**
 * GET /api/torrent/download/[infoHash]/[uid]
 *
 * Allows anyone to download a torrent file by info hash and user UID (for announce URLs).
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing infoHash and uid
 * @returns NextResponse with torrent file (bencoded)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { infoHash: string; uid: string } }
) {
  try {
    const { infoHash } = params
    // Fetch torrent
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: {
        id: true,
        name: true,
        binary: true,
        downloads: true,
        isProtected: true,
        protectedPassword: true,
      }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // TODO: Handle protected torrents (password check)
    // Increment download count
    await prisma.torrent.update({
      where: { infoHash },
      data: { downloads: { increment: 1 } }
    })
    // Decode base64 and return as file
    const buffer = Buffer.from(torrent.binary, "base64")
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/x-bittorrent",
        "Content-Disposition": `attachment; filename=\"${torrent.name}.torrent\"`,
      },
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error downloading torrent:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 