import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Group Management API Routes
 *
 * This file handles creating groups for torrent organization.
 *
 * Features:
 * - Create a new group
 * - Group management for torrents
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/group
 *
 * Creates a new group for organizing torrents.
 *
 * @param request - NextRequest object containing group data
 * @returns NextResponse with creation result
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { name, description, torrentIds = [] } = body
    
    // Validate required fields
    if (!name) {
      return new NextResponse("Group name is required", { status: 400 })
    }
    
    // Validate torrent IDs if provided
    if (torrentIds.length > 0) {
      const validTorrents = await prisma.torrent.findMany({
        where: { id: { in: torrentIds } },
        select: { id: true }
      })
      
      if (validTorrents.length !== torrentIds.length) {
        return new NextResponse("One or more torrent IDs are invalid", { status: 400 })
      }
    }
    
    // Create group
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: session.user.id,
        torrentIds,
      },
      select: {
        id: true,
        name: true,
        description: true,
        torrentIds: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          }
        }
      }
    })
    
    // Log creation for audit
    console.log(`Group created: ${name} by ${session.user.username}`)
    
    return NextResponse.json({
      success: true,
      group,
      message: "Group created successfully",
    })
  } catch (error) {
    console.error("Error creating group:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 