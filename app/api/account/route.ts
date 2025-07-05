import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Account Management API Routes
 * 
 * This file handles all account-related API endpoints for the NexusTracker application.
 * It provides functionality for user account management, statistics, and settings.
 * 
 * Features:
 * - User statistics and profile information
 * - Account verification status
 * - Role and permission checking
 * - Account settings management
 * 
 * Authentication:
 * - All routes require user authentication
 * - User can only access their own account data
 * - Admin users have additional privileges
 */

/**
 * GET /api/account
 * 
 * Fetches the current user's account information including statistics,
 * role, verification status, and other account-related data.
 * 
 * Features:
 * - Current user's account details
 * - Statistics and activity information
 * - Role and permission information
 * - Verification status
 * 
 * @param request - NextRequest object
 * @returns NextResponse with account information
 */
export async function GET() {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Fetch current user with detailed information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
        bonusPoints: true,
        remainingInvites: true,
        timezone: true,
        totpEnabled: true,
        _count: true,
      }
    })
    
    // Check if user exists
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Check if user is banned
    if (user.banned) {
      return new NextResponse("Account is banned", { status: 403 })
    }
    
    // Calculate user statistics
    const stats = {
      invitedUsersCount: user._count['invitedUsers'],
      torrentsCount: user._count['torrents'],
      bookmarksCount: user._count['bookmarks'],
      commentsCount: user._count['comments'],
      ratio: 0,
    }
    
    // Prepare response data
    const responseData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      bonusPoints: user.bonusPoints,
      remainingInvites: user.remainingInvites,
      timezone: user.timezone,
      totpEnabled: user.totpEnabled,
      stats,
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching account information:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 