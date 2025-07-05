import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Individual Request API Route
 * 
 * This file handles operations on specific requests by index.
 * It provides functionality for fetching, editing, and deleting requests.
 * 
 * Features:
 * - Fetch individual request with comments and candidates
 * - Edit request (title, body, bounty)
 * - Delete request (creator only)
 * - Permission validation
 * 
 * Authentication:
 * - Public access for viewing requests
 * - Authenticated access for editing/deleting (creator only)
 */

/**
 * GET /api/request/[index]
 * 
 * Fetches detailed information about a specific request by its index.
 * Includes request metadata, comments, and candidate torrents.
 * 
 * Features:
 * - Complete request information
 * - Comment pagination
 * - Candidate torrents
 * - User information
 * 
 * Query Parameters:
 * - commentPage: Page number for comments (default: 1)
 * - commentLimit: Comments per page (default: 10)
 * 
 * @param request - NextRequest object with query parameters
 * @param params - Route parameters containing request index
 * @returns NextResponse with request details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { index: string } }
) {
  try {
    const { index } = params
    const requestIndex = parseInt(index)
    
    if (isNaN(requestIndex)) {
      return new NextResponse("Invalid request index", { status: 400 })
    }
    
    // Parse query parameters for comment pagination
    const { searchParams } = new URL(request.url)
    const commentPage = parseInt(searchParams.get("commentPage") || "1")
    const commentLimit = parseInt(searchParams.get("commentLimit") || "10")
    const commentOffset = (commentPage - 1) * commentLimit
    
    // Fetch request with all related data
    const requestData = await prisma.request.findUnique({
      where: { index: requestIndex },
      select: {
        id: true,
        index: true,
        title: true,
        body: true,
        status: true,
        bounty: true,
        candidates: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          }
        },
        _count: {
          select: {
            comments: true,
          }
        },
      }
    })
    
    if (!requestData) {
      return new NextResponse("Request not found", { status: 404 })
    }
    
    // Fetch comments for the request
    const [comments, commentCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          requestId: requestData.id,
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
              image: true,
            }
          },
          _count: {
            select: {
              replies: true,
            }
          },
        },
        orderBy: { createdAt: "desc" },
        skip: commentOffset,
        take: commentLimit,
      }),
      prisma.comment.count({
        where: {
          requestId: requestData.id,
          parentId: null,
        }
      })
    ])
    
    // Process comments to add computed fields
    const processedComments = comments.map(comment => ({
      ...comment,
      replyCount: comment._count.replies,
      // Remove internal fields
      _count: undefined,
    }))
    
    // Process request data
    const processedRequest = {
      ...requestData,
      commentCount: requestData._count.comments,
      // Remove internal fields
      _count: undefined,
    }
    
    // Calculate comment pagination metadata
    const totalCommentPages = Math.ceil(commentCount / commentLimit)
    const hasNextCommentPage = commentPage < totalCommentPages
    const hasPreviousCommentPage = commentPage > 1
    
    return NextResponse.json({
      request: processedRequest,
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
    console.error("Error fetching request:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE /api/request/[index]
 * 
 * Deletes a request. Only the creator can delete their own requests.
 * 
 * Features:
 * - Permission validation (creator only)
 * - Refund bonus points if bounty > 0
 * - Cascade deletion of comments
 * 
 * @param request - NextRequest object
 * @param params - Route parameters containing request index
 * @returns NextResponse with deletion result
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { index: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const { index } = params
    const requestIndex = parseInt(index)
    
    if (isNaN(requestIndex)) {
      return new NextResponse("Invalid request index", { status: 400 })
    }
    
    // Fetch request to check permissions
    const requestData = await prisma.request.findUnique({
      where: { index: requestIndex },
      select: {
        id: true,
        title: true,
        createdBy: true,
        bounty: true,
        user: {
          select: {
            username: true,
          }
        }
      }
    })
    
    if (!requestData) {
      return new NextResponse("Request not found", { status: 404 })
    }
    
    // Check if user has permission to delete
    if (session.user.id !== requestData.createdBy) {
      return new NextResponse("You do not have permission to delete this request", { status: 403 })
    }
    
    // Refund bonus points if bounty > 0
    if (requestData.bounty > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { bonusPoints: { increment: requestData.bounty } }
      })
    }
    
    // Delete request (comments will be deleted via onDelete: Cascade)
    await prisma.request.delete({
      where: { index: requestIndex }
    })
    
    // Log deletion for audit
    console.log(`Request deleted: ${requestData.title} by ${session.user.username} (index: ${requestIndex})`)
    
    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting request:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 