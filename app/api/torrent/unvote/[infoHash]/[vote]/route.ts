import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Remove Vote API Route
 *
 * This file handles removing a user's vote (upvote/downvote) from a torrent by info hash.
 * Authenticated users can remove their vote from torrents.
 *
 * Features:
 * - Remove upvote or downvote from a torrent
 * - Only removes the user's own vote
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/torrent/unvote/[infoHash]/[vote]
 *
 * Removes an upvote or downvote from a torrent for the authenticated user.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing infoHash and vote
 * @returns NextResponse with unvote result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { infoHash: string; vote: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const { infoHash, vote } = params
    // Validate vote type
    if (vote !== "upvote" && vote !== "downvote") {
      return new NextResponse("Invalid vote type", { status: 400 })
    }
    // Fetch torrent to ensure it exists
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: { id: true }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // Remove the user's vote of the specified type
    const deleted = await prisma.vote.deleteMany({
      where: {
        userId: session.user.id,
        torrentId: torrent.id,
        type: vote,
      }
    })
    // Log unvote for audit
    console.log(`User ${session.user.username} removed '${vote}' from torrent ${infoHash}`)
    return NextResponse.json({
      success: true,
      message: `Torrent ${vote} removed successfully`,
      deletedCount: deleted.count,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error removing vote from torrent:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 