import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Add Comment API Route
 *
 * This file handles adding comments to a torrent by info hash.
 * Authenticated users can add comments or replies to torrents.
 *
 * Features:
 * - Add top-level or reply comments to torrents
 * - Parent comment support for threading
 * - Permission checks
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/torrent/comment/[infoHash]
 *
 * Adds a comment to a torrent. Optionally, a parentId can be provided for replies.
 *
 * @param request - NextRequest object containing comment data
 * @param params - Route parameters containing info hash
 * @returns NextResponse with comment result
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
    // Parse request body
    const body = await request.json()
    const { content, parentId } = body
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new NextResponse("Comment content is required", { status: 400 })
    }
    // Fetch torrent to ensure it exists
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: { id: true }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // If replying, check parent comment exists and belongs to this torrent
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, torrentId: true }
      })
      if (!parent || parent.torrentId !== torrent.id) {
        return new NextResponse("Parent comment not found or does not belong to this torrent", { status: 400 })
      }
    }
    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        torrentId: torrent.id,
        parentId: parentId || null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          }
        },
        parentId: true,
      }
    })
    // Log comment for audit
    console.log(`Comment added by ${session.user.username} to torrent ${infoHash}`)
    return NextResponse.json({
      success: true,
      comment,
      message: "Comment added successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error adding comment:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 