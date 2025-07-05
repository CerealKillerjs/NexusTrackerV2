import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Admin Report Resolve API Route
 *
 * This file handles resolving reports by administrators.
 *
 * Features:
 * - Resolve reports (admin only)
 *
 * Authentication:
 * - Requires admin role
 */

/**
 * POST /api/admin/reports/[id]/resolve
 *
 * Resolves a report (admin only).
 *
 * @param request - NextRequest object containing resolution details
 * @param params - Route parameters containing report ID
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
    
    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, username: true }
    })
    
    if (!admin || admin.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }
    
    const { id } = params
    
    // Parse request body
    const body = await request.json()
    const { action, notes } = body // action: "resolved" or "dismissed"
    
    if (!action || !["resolved", "dismissed"].includes(action)) {
      return new NextResponse("Invalid action. Must be 'resolved' or 'dismissed'", { status: 400 })
    }
    
    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, status: true, reason: true }
    })
    
    if (!report) {
      return new NextResponse("Report not found", { status: 404 })
    }
    
    if (report.status !== "pending") {
      return new NextResponse("Report is already processed", { status: 400 })
    }
    
    // Resolve the report
    const resolvedReport = await prisma.report.update({
      where: { id },
      data: {
        status: action,
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
      },
      select: {
        id: true,
        status: true,
        resolvedAt: true,
        resolver: {
          select: {
            username: true,
          }
        }
      }
    })
    
    // Log resolution for audit
    console.log(`Report ${action}: ${id} by ${admin.username}${notes ? ` - Notes: ${notes}` : ""}`)
    
    return NextResponse.json({
      success: true,
      report: resolvedReport,
      message: `Report ${action} successfully`,
    })
  } catch (error) {
    console.error("Error resolving report:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 