import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Individual User Profile API Route
 * 
 * This file handles API endpoints for individual user profiles.
 * It provides functionality for viewing user details, statistics, and activity.
 * 
 * Features:
 * - Fetch user profile by username
 * - User statistics and activity tracking
 * - Torrent history and ratio information
 * - Administrative user management
 * 
 * Authentication:
 * - Public profiles may be viewable by unregistered users (configurable)
 * - Private data requires authentication
 * - Admin actions require admin role
 */

/**
 * GET /api/user/[username]
 * 
 * Fetches a specific user's profile information by username.
 * Returns detailed user information including statistics, activity, and torrent history.
 * 
 * Features:
 * - Public profile viewing (configurable)
 * - Detailed user statistics
 * - Torrent upload/download history
 * - Ratio and hit & run tracking
 * - Activity timestamps
 * 
 * @param request - NextRequest object
 * @param params - Object containing the username parameter
 * @returns NextResponse with user profile data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    const { username } = params
    
    // Check if unregistered viewing is allowed
    const allowUnregisteredView = process.env.SQ_ALLOW_UNREGISTERED_VIEW === "true"
    
    // If not authenticated and unregistered viewing is disabled, require auth
    if (!session?.user && !allowUnregisteredView) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Fetch user profile with detailed information
    const user = await prisma.user.findUnique({
      where: { username },
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
        timezone: true,
        // Include invited users count
        invitedUsers: {
          select: { id: true }
        },
        // Include torrents count
        torrents: {
          select: { id: true }
        },
        // Include bookmarks count
        bookmarks: {
          select: { id: true }
        },
      }
    })
    
    // Check if user exists
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // If user is banned, only show limited information
    if (user.banned) {
      return NextResponse.json({
        username: user.username,
        banned: true,
        createdAt: user.createdAt,
      })
    }
    
    // Calculate user statistics
    const stats = {
      invitedUsersCount: user.invitedUsers.length,
      torrentsCount: user.torrents.length,
      bookmarksCount: user.bookmarks.length,
      // TODO: Add ratio calculation when Progress model is implemented
      ratio: 0,
      uploaded: 0,
      downloaded: 0,
      hitAndRuns: 0,
    }
    
    // Prepare response data
    const responseData: any = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      lastSeen: user.lastSeen,
      bonusPoints: user.bonusPoints,
      remainingInvites: user.remainingInvites,
      emailVerified: user.emailVerified,
      timezone: user.timezone,
      stats,
    }
    
    // If authenticated user is viewing their own profile or is admin, include email
    if (session?.user && (session.user.id === user.id)) {
      responseData.email = user.email
    }
    
    // If user is admin, also include email
    if (session?.user) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })
      
      if (currentUser?.role === "admin") {
        responseData.email = user.email
      }
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching user profile:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/user/[username]/ban
 * 
 * Bans a user account. This is an admin-only action that prevents the user
 * from accessing the system while preserving their data.
 * 
 * @param request - NextRequest object
 * @param params - Object containing the username parameter
 * @returns NextResponse with operation result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
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
    
    const { username } = params
    
    // Parse request body for ban reason
    const body = await request.json()
    const reason = body.reason || "No reason provided"
    
    // Find and ban the user
    const userToBan = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!userToBan) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Prevent banning other admins
    if (userToBan.role === "admin") {
      return new NextResponse("Cannot ban admin users", { status: 403 })
    }
    
    // Update user to banned status
    await prisma.user.update({
      where: { username },
      data: { banned: true }
    })
    
    // TODO: Log the ban action for audit trail
    
    return NextResponse.json({
      success: true,
      message: `User ${username} has been banned`,
      reason
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error banning user:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE /api/user/[username]
 * 
 * Permanently deletes a user account and all associated data.
 * This is an admin-only action that cannot be undone.
 * 
 * @param request - NextRequest object
 * @param params - Object containing the username parameter
 * @returns NextResponse with operation result
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
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
    
    const { username } = params
    
    // Find the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!userToDelete) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Prevent deleting other admins
    if (userToDelete.role === "admin") {
      return new NextResponse("Cannot delete admin users", { status: 403 })
    }
    
    // Delete user and all associated data (cascade)
    await prisma.user.delete({
      where: { username }
    })
    
    // TODO: Log the deletion action for audit trail
    
    return NextResponse.json({
      success: true,
      message: `User ${username} has been permanently deleted`
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting user:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 