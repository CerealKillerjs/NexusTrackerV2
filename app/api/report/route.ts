import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Report Management API Routes
 *
 * This file handles creating and listing reports for moderation.
 *
 * Features:
 * - Create a report for a torrent, comment, or user
 * - List all reports (admin/moderator only)
 *
 * Authentication:
 * - Creating a report requires authentication
 * - Listing reports requires admin/moderator
 */

/**
 * POST /api/report
 *
 * Allows an authenticated user to create a report for a torrent, comment, or user.
 *
 * @param request - NextRequest object containing report data
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
    const { torrentId, commentId, reportedId, reason, description } = body
    if (!reason || (!torrentId && !commentId && !reportedId)) {
      return new NextResponse("Report must include a reason and a target (torrent, comment, or user)", { status: 400 })
    }
    // Validate target exists
    if (torrentId) {
      const torrent = await prisma.torrent.findUnique({ where: { id: torrentId } })
      if (!torrent) return new NextResponse("Torrent not found", { status: 404 })
    }
    if (commentId) {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } })
      if (!comment) return new NextResponse("Comment not found", { status: 404 })
    }
    if (reportedId) {
      const user = await prisma.user.findUnique({ where: { id: reportedId } })
      if (!user) return new NextResponse("User not found", { status: 404 })
    }
    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId: reportedId || null,
        torrentId: torrentId || null,
        commentId: commentId || null,
        reason,
        description: description || null,
        status: "pending",
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
      }
    })
    // Log for audit
    console.log(`Report created by ${session.user.username} for reason: ${reason}`)
    return NextResponse.json({
      success: true,
      report,
      message: "Report submitted successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error creating report:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * GET /api/report
 *
 * Lists all reports for moderation. Only accessible to admin or moderator users.
 *
 * @param request - NextRequest object
 * @returns NextResponse with list of reports
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // Fetch user to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return new NextResponse("Forbidden", { status: 403 })
    }
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || ""
    const where: any = {}
    if (status && ["pending", "resolved", "dismissed"].includes(status)) {
      where.status = status
    }
    // Fetch reports with related data
    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        description: true,
        reporter: { select: { id: true, username: true } },
        reported: { select: { id: true, username: true } },
        torrent: { select: { id: true, name: true, infoHash: true } },
        resolvedAt: true,
        resolver: { select: { id: true, username: true } },
      }
    })
    return NextResponse.json({ reports })
  } catch (error) {
    // Log error for debugging
    console.error("Error listing reports:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 