import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Add Vote API Route
 *
 * This file handles voting (upvote/downvote) on a torrent by info hash.
 * Authenticated users can upvote or downvote torrents.
 *
 * Features:
 * - Upvote or downvote a torrent
 * - Prevent duplicate votes
 * - Only one vote type per user per torrent
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/torrent/vote/[infoHash]/[vote]
 *
 * Adds an upvote or downvote to a torrent. Only one vote type per user per torrent.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing infoHash and vote
 * @returns NextResponse with vote result
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
    // Remove any existing vote by this user for this torrent
    await prisma.vote.deleteMany({
      where: {
        userId: session.user.id,
        torrentId: torrent.id,
      }
    })
    // Add new vote
    await prisma.vote.create({
      data: {
        userId: session.user.id,
        torrentId: torrent.id,
        type: vote,
      }
    })
    // Log vote for audit
    console.log(`User ${session.user.username} voted '${vote}' on torrent ${infoHash}`)
    return NextResponse.json({
      success: true,
      message: `Torrent ${vote}d successfully`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error voting on torrent:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 