import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Bookmark Toggle API Route
 *
 * This file handles toggling a torrent bookmark for the authenticated user.
 *
 * Features:
 * - Add or remove a torrent from user's bookmarks
 * - Idempotent: toggles state
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/torrent/bookmark/[infoHash]
 *
 * Toggles a bookmark for a torrent for the authenticated user.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing infoHash
 * @returns NextResponse with bookmark result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { infoHash: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const { infoHash } = params
    // Fetch torrent to ensure it exists
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: { id: true }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // Check if bookmark exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_torrentId: {
          userId: session.user.id,
          torrentId: torrent.id,
        }
      }
    })
    let action: 'added' | 'removed'
    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          userId_torrentId: {
            userId: session.user.id,
            torrentId: torrent.id,
          }
        }
      })
      action = 'removed'
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          torrentId: torrent.id,
        }
      })
      action = 'added'
    }
    // Log for audit
    console.log(`User ${session.user.username} ${action} bookmark for torrent ${infoHash}`)
    return NextResponse.json({
      success: true,
      action,
      message: `Bookmark ${action} successfully`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error toggling bookmark:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 