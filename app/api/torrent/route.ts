import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"

/**
 * Torrent Management API Routes
 * 
 * This file handles all torrent-related API endpoints for the NexusTracker application.
 * It provides functionality for torrent listing, searching, and management.
 * 
 * Features:
 * - Torrent listing and pagination
 * - Advanced search functionality
 * - Category and tag filtering
 * - Sorting and filtering options
 * - User-specific data (bookmarks, etc.)
 * 
 * Authentication:
 * - Public routes for viewing torrents (configurable)
 * - Authenticated routes for user-specific features
 * - Admin routes for moderation
 */

/**
 * GET /api/torrent
 * 
 * Fetches a paginated list of torrents with advanced filtering and search capabilities.
 * Supports various query parameters for filtering, sorting, and searching.
 * 
 * Features:
 * - Pagination support
 * - Text search functionality
 * - Category and source filtering
 * - Tag-based filtering
 * - Multiple sorting options
 * - User-specific bookmark status
 * - Comment counts
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 25)
 * - query: Search query
 * - category: Filter by category (Movies, TV, Music, Books)
 * - source: Filter by source (BluRay, WebDL, etc.)
 * - tag: Filter by specific tag
 * - uploadedBy: Filter by uploader username
 * - sort: Sort field and direction (e.g., "created:desc", "downloads:asc")
 * 
 * @param request - NextRequest object with query parameters
 * @returns NextResponse with paginated torrent list
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if unregistered viewing is allowed
    const allowUnregisteredView = envs.SQ_ALLOW_UNREGISTERED_VIEW
    
    // If not authenticated and unregistered viewing is disabled, require auth
    if (!session?.user && !allowUnregisteredView) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category") || ""
    const source = searchParams.get("source") || ""
    const tag = searchParams.get("tag") || ""
    const uploadedBy = searchParams.get("uploadedBy") || ""
    const sort = searchParams.get("sort") || "created:desc"
    
    // Calculate pagination offset
    const offset = (page - 1) * limit
    
    // Parse sort parameter
    const [sortField, sortDirection] = sort.split(":")
    const orderBy: any = {}
    orderBy[sortField || "createdAt"] = sortDirection === "asc" ? "asc" : "desc"
    
    // Build where clause for filtering
    const where: any = {}
    
    // Add search filter
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ]
    }
    
    // Add category filter
    if (category) {
      where.type = category
    }
    
    // Add source filter
    if (source) {
      where.source = source
    }
    
    // Add tag filter
    if (tag) {
      where.tags = { has: tag }
    }
    
    // Add uploader filter
    if (uploadedBy) {
      where.user = {
        username: uploadedBy
      }
    }
    
    // Fetch torrents with related data
    const [torrents, totalCount] = await Promise.all([
      prisma.torrent.findMany({
        where,
        select: {
          id: true,
          infoHash: true,
          name: true,
          description: true,
          type: true,
          source: true,
          downloads: true,
          size: true,
          createdAt: true,
          freeleech: true,
          tags: true,
          isProtected: true,
          user: {
            select: {
              username: true,
            }
          },
          _count: {
            select: {
              comments: true,
            }
          },
          // Include bookmark status for authenticated users
          ...(session?.user && {
            bookmarks: {
              where: { userId: session.user.id },
              select: { id: true }
            }
          })
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.torrent.count({ where })
    ])
    
    // Process torrents to add computed fields
    const processedTorrents = torrents.map(torrent => ({
      ...torrent,
      commentCount: torrent._count.comments,
      bookmarked: session?.user ? torrent.bookmarks.length > 0 : false,
      // Remove internal fields
      _count: undefined,
      bookmarks: undefined,
    }))
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    return NextResponse.json({
      torrents: processedTorrents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching torrents:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 