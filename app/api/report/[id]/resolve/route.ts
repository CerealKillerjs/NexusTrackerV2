import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Report Resolve API Route
 *
 * This file handles resolving or dismissing a report for moderation.
 * Only admin or moderator users can resolve/dismiss reports.
 *
 * Features:
 * - Resolve or dismiss a report
 * - Set resolution status and optional message
 * - Audit logging
 *
 * Authentication:
 * - Requires admin or moderator
 */

/**
 * POST /api/report/[id]/resolve
 *
 * Allows an admin or moderator to resolve or dismiss a report.
 *
 * @param request - NextRequest object containing resolution data
 * @param params - Route parameters containing report id
 * @returns NextResponse with resolution result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // Fetch user to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, username: true, role: true }
    })
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return new NextResponse("Forbidden", { status: 403 })
    }
    const { id } = params
    // Parse request body
    const body = await request.json()
    const { status, resolutionMessage } = body
    if (!status || !["resolved", "dismissed"].includes(status)) {
      return new NextResponse("Invalid status. Must be 'resolved' or 'dismissed'", { status: 400 })
    }
    // Fetch report to ensure it exists
    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) {
      return new NextResponse("Report not found", { status: 404 })
    }
    // Update report
    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolvedAt: new Date(),
        resolvedBy: user.id,
        description: resolutionMessage || report.description,
      },
      select: {
        id: true,
        status: true,
        resolvedAt: true,
        resolver: { select: { id: true, username: true } },
      }
    })
    // Log for audit
    console.log(`Report ${id} ${status} by ${user.username}`)
    return NextResponse.json({
      success: true,
      report: updated,
      message: `Report ${status}`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error resolving report:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 