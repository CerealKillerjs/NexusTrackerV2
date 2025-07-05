import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Request Add Comment API Route
 *
 * This file handles adding comments to a request by request ID.
 * Authenticated users can add comments or replies to requests.
 *
 * Features:
 * - Add top-level or reply comments to requests
 * - Parent comment support for threading
 * - Permission checks
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/request/comment/[requestId]
 *
 * Adds a comment to a request. Optionally, a parentId can be provided for replies.
 *
 * @param request - NextRequest object containing comment data
 * @param params - Route parameters containing requestId
 * @returns NextResponse with comment result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const { requestId } = params
    // Parse request body
    const body = await request.json()
    const { content, parentId } = body
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new NextResponse("Comment content is required", { status: 400 })
    }
    // Fetch request to ensure it exists
    const reqObj = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true }
    })
    if (!reqObj) {
      return new NextResponse("Request not found", { status: 404 })
    }
    // If replying, check parent comment exists and belongs to this request
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, requestId: true }
      })
      if (!parent || parent.requestId !== reqObj.id) {
        return new NextResponse("Parent comment not found or does not belong to this request", { status: 400 })
      }
    }
    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        requestId: reqObj.id,
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
    console.log(`Comment added by ${session.user.username} to request ${requestId}`)
    return NextResponse.json({
      success: true,
      comment,
      message: "Comment added successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error adding comment to request:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 