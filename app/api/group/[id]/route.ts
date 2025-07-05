import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Individual Group Management API Routes
 *
 * This file handles operations on specific groups.
 *
 * Features:
 * - Get group details
 * - Add torrents to group
 * - Remove torrents from group
 * - Delete group
 *
 * Authentication:
 * - GET: Public access
 * - POST/DELETE: Requires user authentication
 */

/**
 * GET /api/group/[id]
 *
 * Retrieves details of a specific group including its torrents.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing group ID
 * @returns NextResponse with group details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Get group details
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        torrentIds: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          }
        }
      }
    })
    
    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }
    
    // Get torrent details for the group
    const torrents = await prisma.torrent.findMany({
      where: { id: { in: group.torrentIds } },
      select: {
        id: true,
        name: true,
        size: true,
        downloads: true,
        createdAt: true,
        type: true,
        source: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      group: {
        ...group,
        torrents,
        torrentCount: torrents.length
      }
    })
  } catch (error) {
    console.error("Error fetching group:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/group/[id]/add
 *
 * Adds torrents to a group.
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
    
    // Validate torrent IDs
    const validTorrents = await prisma.torrent.findMany({
      where: { id: { in: torrentIds } },
      select: { id: true }
    })
    
    if (validTorrents.length !== torrentIds.length) {
      return new NextResponse("One or more torrent IDs are invalid", { status: 400 })
    }
    
    // Add torrents to group (avoid duplicates)
    const updatedTorrentIds = [...new Set([...group.torrentIds, ...torrentIds])]
    
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
      message: "Torrents added to group successfully",
    })
  } catch (error) {
    console.error("Error adding torrents to group:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE /api/group/[id]
 *
 * Deletes a group.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing group ID
 * @returns NextResponse with deletion result
 */
export async function DELETE(
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
    
    // Get the group and verify ownership
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, name: true, createdBy: true }
    })
    
    if (!group) {
      return new NextResponse("Group not found", { status: 404 })
    }
    
    if (group.createdBy !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }
    
    // Delete the group
    await prisma.group.delete({
      where: { id }
    })
    
    // Log deletion for audit
    console.log(`Group deleted: ${group.name} by ${session.user.username}`)
    
    return NextResponse.json({
      success: true,
      message: "Group deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting group:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 