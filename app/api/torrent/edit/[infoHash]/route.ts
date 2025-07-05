import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"

/**
 * Torrent Edit API Route
 * 
 * This file handles editing torrent metadata by info hash.
 * Only the uploader or an admin can edit a torrent.
 * 
 * Features:
 * - Edit torrent name, description, type, source, tags, poster, mediaInfo
 * - Permission checks for uploader/admin
 * - Category and source validation
 * - Tag processing
 * 
 * Authentication:
 * - Requires user authentication
 * - Only uploader or admin can edit
 */

/**
 * POST /api/torrent/edit/[infoHash]
 * 
 * Edits the metadata of a torrent. Only the uploader or an admin can edit.
 * 
 * @param request - NextRequest object containing new torrent data
 * @param params - Route parameters containing info hash
 * @returns NextResponse with edit result
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
    const {
      name,
      description,
      type,
      source,
      tags,
      poster,
      mediaInfo,
    } = body
    // Validate required fields
    if (!name || !type || !description) {
      return new NextResponse("Form is incomplete", { status: 400 })
    }
    // Fetch torrent to check permissions
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: {
        id: true,
        uploadedBy: true,
        name: true,
      }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // Fetch user to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, username: true, role: true }
    })
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    const isAdmin = user.role === "admin"
    const isUploader = user.id === torrent.uploadedBy
    if (!isAdmin && !isUploader) {
      return new NextResponse("You do not have permission to edit this torrent", { status: 403 })
    }
    // Validate category if required
    if (Object.keys(envs.SQ_TORRENT_CATEGORIES).length > 0 && !type) {
      return new NextResponse("Torrent must have a category", { status: 400 })
    }
    // Validate source if category is provided
    if (type && envs.SQ_TORRENT_CATEGORIES[type as keyof typeof envs.SQ_TORRENT_CATEGORIES]) {
      const validSources = envs.SQ_TORRENT_CATEGORIES[type as keyof typeof envs.SQ_TORRENT_CATEGORIES]
      if (source && !validSources.includes(source)) {
        return new NextResponse("Torrent must have a valid source", { status: 400 })
      }
    }
    // Process tags
    const processedTags = tags ? tags.split(",").map((tag: string) => 
      tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
    ).filter(Boolean) : []
    // Update torrent
    await prisma.torrent.update({
      where: { infoHash },
      data: {
        name,
        description,
        type,
        source,
        tags: processedTags,
        poster: poster || null,
        mediaInfo: mediaInfo || null,
      }
    })
    // Log edit for audit
    console.log(`Torrent edited: ${name} by ${session.user.username} (${infoHash})`)
    return NextResponse.json({
      success: true,
      message: "Torrent edited successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error editing torrent:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 