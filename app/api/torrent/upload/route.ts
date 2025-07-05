import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"
import bencode from "bencode"
import crypto from "crypto"

/**
 * Torrent Upload API Route
 * 
 * This file handles torrent file uploads and processing for the NexusTracker application.
 * It provides functionality for creating new torrent entries with validation and processing.
 * 
 * Features:
 * - Torrent file validation and parsing
 * - Info hash generation and duplicate checking
 * - File extension blacklist validation
 * - Category and source validation
 * - Anonymous upload support
 * - Protected torrent support
 * - Group management
 * 
 * Authentication:
 * - Requires user authentication
 * - Users can only upload to their own account
 * - Admin users have additional privileges
 */

/**
 * POST /api/torrent/upload
 * 
 * Uploads a new torrent to the tracker. Processes the torrent file,
 * validates metadata, and creates a new torrent entry.
 * 
 * Features:
 * - Torrent file parsing and validation
 * - Duplicate detection
 * - File extension validation
 * - Category and source validation
 * - Anonymous upload support
 * - Protected torrent support
 * 
 * @param request - NextRequest object containing torrent data
 * @returns NextResponse with upload result
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const {
      torrent: torrentBase64,
      name,
      description,
      type,
      source,
      poster,
      tags,
      mediaInfo,
      isProtected = false,
      protectedPassword,
      groupWith,
      anonymous = false,
    } = body
    
    // Validate required fields
    if (!torrentBase64 || !name || !description) {
      return new NextResponse("Form is incomplete", { status: 400 })
    }
    
    // Validate category if required
    if (Object.keys(envs.SQ_TORRENT_CATEGORIES).length > 0 && !type) {
      return new NextResponse("Torrent must have a category", { status: 400 })
    }
    
    // Validate source if category is provided
    if (type && envs.SQ_TORRENT_CATEGORIES[type as keyof typeof envs.SQ_TORRENT_CATEGORIES]) {
      const validSources = envs.SQ_TORRENT_CATEGORIES[type as keyof typeof envs.SQ_TORRENT_CATEGORIES]
      if (!validSources.includes(source)) {
        return new NextResponse("Torrent must have a valid source", { status: 400 })
      }
    }
    
    // Decode and parse torrent file
    let parsed
    try {
      const torrentBuffer = Buffer.from(torrentBase64, "base64")
      parsed = bencode.decode(torrentBuffer)
    } catch {
      return new NextResponse("Invalid torrent file", { status: 400 })
    }
    
    // Validate torrent structure
    if (!parsed.info) {
      return new NextResponse("Invalid torrent file: missing info", { status: 400 })
    }
    
    // Fetch current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        uid: true,
        banned: true,
      }
    })
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    if (user.banned) {
      return new NextResponse("Account is banned", { status: 403 })
    }
    
    // Modify torrent for private tracker
    parsed.info.private = 1
    parsed.info.source = envs.SQ_BASE_URL
    parsed.announce = `${envs.SQ_BASE_URL}/sq/${user.uid}/announce`
    delete parsed["announce-list"]
    
    // Generate info hash
    const infoHash = crypto
      .createHash("sha1")
      .update(bencode.encode(parsed.info))
      .digest("hex")
    
    // Check for duplicate torrent
    const existingTorrent = await prisma.torrent.findUnique({
      where: { infoHash }
    })
    
    if (existingTorrent) {
      return new NextResponse("Torrent with this info hash already exists", { status: 409 })
    }
    
    // Process files
    let files
    if (parsed.info.files) {
      files = parsed.info.files.map((file: any) => ({
        path: file.path.map((tok: any) => tok.toString()).join("/"),
        size: file.length,
      }))
    } else {
      files = [
        {
          path: parsed.info.name.toString(),
          size: parsed.info.length,
        },
      ]
    }
    
    // Check for blacklisted file extensions
    const hasBlacklistedFiles = files.some((file: { path: string; size: number }) =>
      envs.SQ_EXTENSION_BLACKLIST.some((ext) =>
        file.path.endsWith(`.${ext}`)
      )
    )
    
    if (hasBlacklistedFiles) {
      return new NextResponse("One or more files have blacklisted file extensions", { status: 403 })
    }
    
    // Calculate total size
    const size = parsed.info.length || files.reduce((acc: number, cur: any) => acc + cur.size, 0)
    
    // Process tags
    const processedTags = tags ? tags.split(",").map((tag: string) => 
      tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
    ).filter(Boolean) : []
    
    // Handle group management
    const groupId = null
    if (groupWith) {
      const groupWithTorrent = await prisma.torrent.findUnique({
        where: { infoHash: groupWith }
      })
      
      if (!groupWithTorrent) {
        return new NextResponse("Cannot group with torrent that does not exist", { status: 400 })
      }
      
      // TODO: Implement group management when Group model is added
      console.log(`Grouping with torrent: ${groupWith}`)
    }
    
    // Create new torrent
    const newTorrent = await prisma.torrent.create({
      data: {
        name,
        description,
        type: type || null,
        source: source || null,
        infoHash,
        binary: torrentBase64,
        poster: poster || null,
        uploadedBy: session.user.id,
        downloads: 0,
        anonymous,
        size: BigInt(size),
        files,
        freeleech: envs.SQ_SITE_WIDE_FREELEECH,
        tags: processedTags,
        groupId,
        mediaInfo: mediaInfo || null,
        isProtected,
        protectedPassword: protectedPassword || null,
      },
      select: {
        id: true,
        infoHash: true,
        name: true,
        size: true,
        createdAt: true,
      }
    })
    
    // Log upload for audit
    console.log(`Torrent uploaded: ${name} by ${user.username} (${infoHash})`)
    
    return NextResponse.json({
      success: true,
      infoHash: newTorrent.infoHash,
      torrent: newTorrent,
      message: "Torrent uploaded successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error uploading torrent:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 