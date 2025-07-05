import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Delete Comment API Route
 *
 * This file handles deleting comments from a torrent by comment ID.
 * Authenticated users can delete their own comments; admins can delete any comment.
 *
 * Features:
 * - Delete comment by ID
 * - Permission checks for user/admin
 * - Cascade delete replies
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * DELETE /api/torrent/comment/delete/[commentId]
 *
 * Deletes a comment from a torrent. Only the comment author or an admin can delete.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing commentId
 * @returns NextResponse with deletion result
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const { commentId } = params
    // Fetch comment to check permissions
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        content: true,
      }
    })
    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 })
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
    const isAuthor = user.id === comment.userId
    if (!isAdmin && !isAuthor) {
      return new NextResponse("You do not have permission to delete this comment", { status: 403 })
    }
    // Delete comment (replies will be deleted via onDelete: Cascade)
    await prisma.comment.delete({
      where: { id: commentId }
    })
    // Log deletion for audit
    console.log(`Comment deleted by ${user.username} (commentId: ${commentId})`)
    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting comment:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 