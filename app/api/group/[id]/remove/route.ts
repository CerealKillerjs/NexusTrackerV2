import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Remove Torrents from Group API Route
 *
 * This file handles removing torrents from groups.
 *
 * Features:
 * - Remove torrents from group
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/group/[id]/remove
 *
 * Removes torrents from a group.
 *
 * @param request - NextRequest object containing torrent IDs
 * @param params - Route parameters containing group ID
 * @returns NextResponse with update result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const { id } = params
    
    // Parse request body
    const body = await request.json()
    const { torrentIds } = body
    
    if (!torrentIds || !Array.isArray(torrentIds)) {
      return new NextResponse("Torrent IDs array is required", { status: 400 })
    }
    
    // Get the group and verify ownership
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, createdBy: true, torrentIds: true }
    })
    
    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }
    
    if (group.createdBy !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }
    
    // Remove torrents from group
    const updatedTorrentIds = group.torrentIds.filter(
      torrentId => !torrentIds.includes(torrentId)
    )
    
    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id },
      data: { torrentIds: updatedTorrentIds },
      select: {
        id: true,
        name: true,
        torrentIds: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      group: updatedGroup,
      message: "Torrents removed from group successfully",
    })
  } catch (error) {
    console.error("Error removing torrents from group:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 