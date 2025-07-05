import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Admin User Unban API Route
 *
 * This file handles unbanning users by administrators.
 *
 * Features:
 * - Unban users (admin only)
 *
 * Authentication:
 * - Requires admin role
 */

/**
 * POST /api/admin/users/[id]/unban
 *
 * Unbans a user (admin only).
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing user ID
 * @returns NextResponse with unban result
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
    
    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, banned: true }
    })
    
    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    if (!targetUser.banned) {
      return new NextResponse("User is not banned", { status: 400 })
    }
    
    // Unban the user
    const unbannedUser = await prisma.user.update({
      where: { id },
      data: {
        banned: false,
        bannedAt: null,
        bannedBy: null,
      },
      select: {
        id: true,
        username: true,
        banned: true,
        bannedAt: true,
        bannedBy: true,
      }
    })
    
    // Log unban action for audit
    console.log(`User unbanned: ${targetUser.username} by ${admin.username}`)
    
    return NextResponse.json({
      success: true,
      user: unbannedUser,
      message: "User unbanned successfully",
    })
  } catch (error) {
    console.error("Error unbanning user:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 