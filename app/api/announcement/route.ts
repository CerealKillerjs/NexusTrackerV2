import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Announcement Management API Routes
 *
 * This file handles listing and creating announcements.
 *
 * Features:
 * - List all announcements with pagination
 * - Create a new announcement (admin/moderator only)
 * - Pin/unpin announcements
 *
 * Authentication:
 * - Public for GET
 * - Admin/moderator for POST
 */

/**
 * GET /api/announcement
 *
 * Lists all announcements with pagination and filtering.
 *
 * @param request - NextRequest object with query parameters
 * @returns NextResponse with paginated announcement list
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const pinned = searchParams.get("pinned") === "true"
    
    // Calculate pagination offset
    const offset = (page - 1) * limit
    
    // Build where clause for filtering
    const where: any = {}
    if (pinned) {
      where.isPinned = true
    }
    
    // Fetch announcements with related data
    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
            }
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" }
        ],
        skip: offset,
        take: limit,
      }),
      prisma.announcement.count({ where })
    ])
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    return NextResponse.json({
      announcements,
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
    console.error("Error fetching announcements:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/announcement
 *
 * Creates a new announcement. Only admin or moderator can create.
 *
 * @param request - NextRequest object containing announcement data
 * @returns NextResponse with creation result
 */
export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json()
    const { title, content, isPinned = false } = body
    
    // Validate required fields
    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 })
    }
    
    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        isPinned,
        createdBy: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        isPinned: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          }
        }
      }
    })
    
    // Log creation for audit
    console.log(`Announcement created: ${title} by ${user.username}`)
    
    return NextResponse.json({
      success: true,
      announcement,
      message: "Announcement created successfully",
    })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 