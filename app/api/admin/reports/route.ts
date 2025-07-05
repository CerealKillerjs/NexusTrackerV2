import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Admin Reports Management API Routes
 *
 * This file handles admin operations on reports.
 *
 * Features:
 * - List all reports (admin only)
 * - Report management for administrators
 *
 * Authentication:
 * - Requires admin role
 */

/**
 * GET /api/admin/reports
 *
 * Retrieves a list of all reports for admin management.
 *
 * @param request - NextRequest object with query parameters
 * @returns NextResponse with report list
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (!user || user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status") || ""
    const reason = searchParams.get("reason") || ""
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (reason) {
      where.reason = { contains: reason, mode: "insensitive" }
    }
    
    // Get reports with pagination
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          reason: true,
          description: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          reporter: {
            select: {
              id: true,
              username: true,
            }
          },
          reported: {
            select: {
              id: true,
              username: true,
            }
          },
          torrent: {
            select: {
              id: true,
              name: true,
            }
          },
          resolver: {
            select: {
              id: true,
              username: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({ where })
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    })
  } catch (error) {
    console.error("Error fetching admin reports:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 