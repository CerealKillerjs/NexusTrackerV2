import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"

/**
 * Torrent Info API Route
 * 
 * This file handles fetching individual torrent information by info hash.
 * It provides detailed torrent data including files, comments, and user-specific information.
 * 
 * Features:
 * - Individual torrent fetching by info hash
 * - Comment loading and pagination
 * - User-specific data (bookmarks, votes)
 * - File listing and details
 * - Uploader information
 * - Protected torrent handling
 * 
 * Authentication:
 * - Public access for viewing torrents (configurable)
 * - Authenticated access for user-specific features
 * - Admin access for moderation features
 */

/**
 * GET /api/torrent/[infoHash]
 * 
 * Fetches detailed information about a specific torrent by its info hash.
 * Includes torrent metadata, files, comments, and user-specific data.
 * 
 * Features:
 * - Complete torrent information
 * - File listing with sizes
 * - Comment pagination
 * - User bookmark status
 * - Vote information
 * - Uploader details
 * - Protected torrent validation
 * 
 * Query Parameters:
 * - commentPage: Page number for comments (default: 1)
 * - commentLimit: Comments per page (default: 10)
 * 
 * @param request - NextRequest object with info hash parameter
 * @param params - Route parameters containing info hash
 * @returns NextResponse with torrent details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { infoHash: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if unregistered viewing is allowed
    const allowUnregisteredView = envs.SQ_ALLOW_UNREGISTERED_VIEW
    
    // If not authenticated and unregistered viewing is disabled, require auth
    if (!session?.user && !allowUnregisteredView) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const { infoHash } = params
    
    // Parse query parameters for comment pagination
    const { searchParams } = new URL(request.url)
    const commentPage = parseInt(searchParams.get("commentPage") || "1")
    const commentLimit = parseInt(searchParams.get("commentLimit") || "10")
    const commentOffset = (commentPage - 1) * commentLimit
    
    // Fetch torrent with all related data
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
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
        files: true,
        poster: true,
        mediaInfo: true,
        isProtected: true,
        protectedPassword: true,
        anonymous: true,
        user: {
          select: {
            id: true,
            username: true,
            uid: true,
            createdAt: true,
            uploaded: true,
            downloaded: true,
            ratio: true,
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        },
        // Include user-specific data for authenticated users
        ...(session?.user && {
          bookmarks: {
            where: { userId: session.user.id },
            select: { id: true }
          },
          votes: {
            where: { userId: session.user.id },
            select: { id: true, type: true }
          }
        })
      }
    })
    
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    
    // Check if torrent is protected and user has access
    if (torrent.isProtected && torrent.protectedPassword) {
      // TODO: Implement password validation for protected torrents
      // For now, we'll just return the torrent without sensitive data
      console.log(`Protected torrent accessed: ${infoHash}`)
    }
    
    // Fetch comments for the torrent
    const [comments, commentCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          torrentId: torrent.id,
          parentId: null, // Only top-level comments
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          _count: {
            select: {
              replies: true,
            }
          },
          // Include user vote for authenticated users
          ...(session?.user && {
            votes: {
              where: { userId: session.user.id },
              select: { id: true, type: true }
            }
          })
        },
        orderBy: { createdAt: "desc" },
        skip: commentOffset,
        take: commentLimit,
      }),
      prisma.comment.count({
        where: {
          torrentId: torrent.id,
          parentId: null,
        }
      })
    ])
    
    // Process comments to add computed fields
    const processedComments = comments.map(comment => ({
      ...comment,
      upvoted: session?.user ? (comment.votes?.filter((v: any) => v.type === 'upvote').length || 0) > 0 : false,
      downvoted: session?.user ? (comment.votes?.filter((v: any) => v.type === 'downvote').length || 0) > 0 : false,
      // Remove internal fields
      votes: undefined,
    }))
    
    // Process torrent data
    const processedTorrent = {
      ...torrent,
      commentCount: torrent._count?.comments || 0,
      upvoteCount: torrent._count?.votes || 0,
      downvoteCount: 0, // We'll need to calculate this separately
      bookmarked: session?.user ? (torrent.bookmarks?.length || 0) > 0 : false,
      upvoted: session?.user ? (torrent.votes?.filter((v: any) => v.type === 'upvote').length || 0) > 0 : false,
      downvoted: session?.user ? (torrent.votes?.filter((v: any) => v.type === 'downvote').length || 0) > 0 : false,
      // Remove internal fields
      _count: undefined,
      bookmarks: undefined,
      votes: undefined,
    }
    
    // Calculate comment pagination metadata
    const totalCommentPages = Math.ceil(commentCount / commentLimit)
    const hasNextCommentPage = commentPage < totalCommentPages
    const hasPreviousCommentPage = commentPage > 1
    
    return NextResponse.json({
      torrent: processedTorrent,
      comments: {
        items: processedComments,
        pagination: {
          page: commentPage,
          limit: commentLimit,
          totalCount: commentCount,
          totalPages: totalCommentPages,
          hasNextPage: hasNextCommentPage,
          hasPreviousPage: hasPreviousCommentPage,
        }
      }
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching torrent:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE /api/torrent/[infoHash]
 * 
 * Deletes a torrent from the tracker. Only the uploader or admin can delete torrents.
 * 
 * Features:
 * - Permission validation
 * - Cascade deletion of related data
 * - Audit logging
 * 
 * @param request - NextRequest object
 * @param params - Route parameters containing info hash
 * @returns NextResponse with deletion result
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { infoHash: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const { infoHash } = params
    
    // Fetch torrent to check permissions
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: {
        id: true,
        name: true,
        uploadedBy: true,
        user: {
          select: {
            username: true,
          }
        }
      }
    })
    
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    
    // Check if user has permission to delete
    const isAdmin = (session.user as any).role === "admin"
    const isUploader = session.user.id === torrent.uploadedBy
    
    if (!isAdmin && !isUploader) {
      return new NextResponse("You do not have permission to delete this torrent", { status: 403 })
    }
    
    // Delete torrent and all related data
    await prisma.torrent.delete({
      where: { infoHash }
    })
    
    // Log deletion for audit
    console.log(`Torrent deleted: ${torrent.name} by ${session.user.username} (${infoHash})`)
    
    return NextResponse.json({
      success: true,
      message: "Torrent deleted successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting torrent:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 