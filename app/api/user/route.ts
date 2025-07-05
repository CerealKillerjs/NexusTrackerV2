import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"

/**
 * User Management API Routes
 * 
 * This file handles all user-related API endpoints for the NexusTracker application.
 * It provides functionality for user management, profile viewing, and administrative actions.
 * 
 * Features:
 * - Fetch all users (admin only)
 * - User profile management
 * - Administrative user actions
 * - Role-based access control
 * 
 * Authentication:
 * - All routes require user authentication
 * - Admin routes require admin role
 * - Rate limiting applied to all endpoints
 */

/**
 * GET /api/user
 * 
 * Fetches all users in the system. This is an admin-only endpoint that returns
 * a paginated list of all registered users with their basic information.
 * 
 * Features:
 * - Pagination support
 * - Role-based filtering
 * - Search functionality
 * - Sorting options
 * 
 * @param request - NextRequest object containing query parameters
 * @returns NextResponse with paginated user list
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Fetch current user with role from database
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    // Check if user has admin role
    if (!currentUser || currentUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }
    
    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    
    // Calculate pagination offset
    const offset = (page - 1) * limit
    
    // Build where clause for filtering
    const where: any = {}
    
    // Add search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // Add role filter
    if (role) {
      where.role = role
    }
    
    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder
    
    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          banned: true,
          createdAt: true,
          lastSeen: true,
          bonusPoints: true,
          remainingInvites: true,
          emailVerified: true,
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    // Return paginated response
    return NextResponse.json({
      users,
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
    console.error("Error fetching users:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 