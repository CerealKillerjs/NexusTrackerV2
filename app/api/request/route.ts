import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Request Management API Routes
 * 
 * This file handles all request-related API endpoints for the NexusTracker application.
 * It provides functionality for creating and listing requests.
 * 
 * Features:
 * - Request listing and pagination
 * - Request creation
 * - Status filtering
 * - User-specific data
 * 
 * Authentication:
 * - Public routes for viewing requests
 * - Authenticated routes for creating requests
 */

/**
 * GET /api/request
 * 
 * Fetches a paginated list of requests with filtering and sorting options.
 * 
 * Features:
 * - Pagination support
 * - Status filtering (open, filled, closed)
 * - Sorting by creation date
 * - User information
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 25)
 * - status: Filter by status (open, filled, closed)
 * - sort: Sort field and direction (e.g., "createdAt:desc")
 * 
 * @param request - NextRequest object with query parameters
 * @returns NextResponse with paginated request list
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const status = searchParams.get("status") || ""
    const sort = searchParams.get("sort") || "createdAt:desc"
    
    // Calculate pagination offset
    const offset = (page - 1) * limit
    
    // Parse sort parameter
    const [sortField, sortDirection] = sort.split(":")
    const orderBy: any = {}
    orderBy[sortField || "createdAt"] = sortDirection === "asc" ? "asc" : "desc"
    
    // Build where clause for filtering
    const where: any = {}
    
    // Add status filter
    if (status && ["open", "filled", "closed"].includes(status)) {
      where.status = status
    }
    
    // Fetch requests with related data
    const [requests, totalCount] = await Promise.all([
      prisma.request.findMany({
        where,
        select: {
          id: true,
          index: true,
          title: true,
          status: true,
          bounty: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          _count: {
            select: {
              comments: true,
            }
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.request.count({ where })
    ])
    
    // Process requests to add computed fields
    const processedRequests = requests.map(request => ({
      ...request,
      commentCount: request._count.comments,
      // Remove internal fields
      _count: undefined,
    }))
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    return NextResponse.json({
      requests: processedRequests,
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
    console.error("Error fetching requests:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/request
 * 
 * Creates a new request. Requires user authentication.
 * 
 * Features:
 * - Request creation with title and body
 * - Automatic index assignment
 * - Bonus points bounty support
 * - Permission validation
 * 
 * @param request - NextRequest object containing request data
 * @returns NextResponse with creation result
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { title, body: requestBody, bounty = 0 } = body
    
    // Validate required fields
    if (!title || !requestBody) {
      return new NextResponse("Request must include title and body", { status: 400 })
    }
    
    // Validate bounty
    if (bounty < 0) {
      return new NextResponse("Bounty cannot be negative", { status: 400 })
    }
    
    // Check if user has enough bonus points if bounty > 0
    if (bounty > 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { bonusPoints: true }
      })
      
      if (!user || user.bonusPoints < bounty) {
        return new NextResponse("Insufficient bonus points", { status: 400 })
      }
    }
    
    // Get the next request index
    const lastRequest = await prisma.request.findFirst({
      orderBy: { index: "desc" },
      select: { index: true }
    })
    
    const nextIndex = (lastRequest?.index || 0) + 1
    
    // Create the request
    const newRequest = await prisma.request.create({
      data: {
        index: nextIndex,
        title: title.trim(),
        body: requestBody.trim(),
        bounty,
        createdBy: session.user.id,
        status: "open",
        candidates: [],
      },
      select: {
        id: true,
        index: true,
        title: true,
        status: true,
        bounty: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          }
        }
      }
    })
    
    // Deduct bonus points if bounty > 0
    if (bounty > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { bonusPoints: { decrement: bounty } }
      })
    }
    
    // Log creation for audit
    console.log(`Request created: ${title} by ${session.user.username} (index: ${nextIndex})`)
    
    return NextResponse.json({
      success: true,
      request: newRequest,
      message: "Request created successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error creating request:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 