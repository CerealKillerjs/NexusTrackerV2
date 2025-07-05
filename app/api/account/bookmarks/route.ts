import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * User Bookmarks API Route
 * 
 * This file handles user bookmark management for torrents.
 * It provides functionality for viewing and managing bookmarked torrents.
 * 
 * Features:
 * - Fetch user's bookmarked torrents
 * - Bookmark management
 * - Pagination support
 * - Sorting and filtering
 * 
 * Authentication:
 * - All routes require user authentication
 * - Users can only access their own bookmarks
 * - Bookmark data includes torrent information
 */

/**
 * GET /api/account/bookmarks
 * 
 * Fetches all bookmarked torrents for the current user.
 * Returns a paginated list of bookmarked torrents with details.
 * 
 * Features:
 * - List of user's bookmarked torrents
 * - Pagination support
 * - Sorting options
 * - Torrent details included
 * 
 * @param request - NextRequest object
 * @returns NextResponse with bookmarked torrents
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const offset = (page - 1) * limit
    
    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder
    
    // Fetch bookmarked torrents with details
    const [bookmarks, totalCount] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          createdAt: true,
          torrent: {
            select: {
              id: true,
              name: true,
              infoHash: true,
              size: true,
              createdAt: true,
              poster: true,
              downloads: true,
              freeleech: true,
              type: true,
              source: true,
              user: {
                select: {
                  username: true,
                }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.bookmark.count({
        where: { userId: session.user.id }
      })
    ])
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    return NextResponse.json({
      bookmarks,
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
    console.error("Error fetching bookmarks:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/account/bookmarks
 * 
 * Adds a torrent to the current user's bookmarks.
 * 
 * @param request - NextRequest object containing torrent ID
 * @returns NextResponse with operation result
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
    const { torrentId } = body
    
    // Validate required fields
    if (!torrentId) {
      return new NextResponse("Request must include torrentId", { status: 400 })
    }
    
    // Check if torrent exists
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      select: { id: true, name: true }
    })
    
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    
    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_torrentId: {
          userId: session.user.id,
          torrentId: torrentId
        }
      }
    })
    
    if (existingBookmark) {
      return new NextResponse("Torrent already bookmarked", { status: 409 })
    }
    
    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        torrentId: torrentId,
      },
      select: {
        id: true,
        createdAt: true,
        torrent: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      bookmark,
      message: `"${torrent.name}" added to bookmarks`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error adding bookmark:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE /api/account/bookmarks
 * 
 * Removes a torrent from the current user's bookmarks.
 * 
 * @param request - NextRequest object containing torrent ID
 * @returns NextResponse with operation result
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { torrentId } = body
    
    // Validate required fields
    if (!torrentId) {
      return new NextResponse("Request must include torrentId", { status: 400 })
    }
    
    // Delete bookmark
    const deletedBookmark = await prisma.bookmark.delete({
      where: {
        userId_torrentId: {
          userId: session.user.id,
          torrentId: torrentId
        }
      },
      select: {
        torrent: {
          select: {
            name: true,
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `"${deletedBookmark.torrent.name}" removed from bookmarks`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error removing bookmark:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 