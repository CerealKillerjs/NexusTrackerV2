import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * User Unban API Route
 * 
 * This file handles the unban functionality for user accounts.
 * It allows administrators to restore access to previously banned users.
 * 
 * Features:
 * - Unban user accounts
 * - Admin-only access control
 * - Audit trail for unban actions
 * 
 * Authentication:
 * - Requires admin role
 * - Logs all unban actions
 */

/**
 * POST /api/user/[username]/unban
 * 
 * Unbans a previously banned user account. This restores the user's
 * access to the system while preserving all their data and history.
 * 
 * Features:
 * - Restores user access
 * - Preserves all user data
 * - Admin-only operation
 * - Audit logging
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
    
    // Parse request body for unban reason
    const body = await request.json()
    const reason = body.reason || "No reason provided"
    
    // Find the user to unban
    const userToUnban = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!userToUnban) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Check if user is actually banned
    if (!userToUnban.banned) {
      return new NextResponse("User is not banned", { status: 400 })
    }
    
    // Update user to unbanned status
    await prisma.user.update({
      where: { username },
      data: { banned: false }
    })
    
    // TODO: Log the unban action for audit trail
    console.log(`User ${username} unbanned by admin ${session.user.username}. Reason: ${reason}`)
    
    return NextResponse.json({
      success: true,
      message: `User ${username} has been unbanned`,
      reason
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error unbanning user:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 