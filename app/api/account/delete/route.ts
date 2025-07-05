import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * Account Deletion API Route
 * 
 * This file handles the permanent deletion of user accounts.
 * It provides secure account removal with password verification.
 * 
 * Features:
 * - Password verification for account deletion
 * - Permanent account removal
 * - Data cleanup and cascading deletes
 * - Security logging for account deletions
 * 
 * Authentication:
 * - Requires user authentication
 * - Requires password verification
 * - Logs account deletion events
 * - Cannot be undone
 */

/**
 * POST /api/account/delete
 * 
 * Permanently deletes the current user's account after verifying their password.
 * This action cannot be undone and will remove all user data.
 * 
 * Features:
 * - Password verification
 * - Permanent account deletion
 * - Data cleanup
 * - Security logging
 * 
 * @param request - NextRequest object containing password
 * @returns NextResponse with operation result
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
    const { password, confirm } = body
    
    // Validate required fields
    if (!password) {
      return new NextResponse("Request must include password", { status: 400 })
    }
    
    // Validate confirmation
    if (confirm !== "DELETE") {
      return new NextResponse("Please type 'DELETE' to confirm account deletion", { status: 400 })
    }
    
    // Fetch current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
      }
    })
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Prevent deletion of admin accounts
    if (user.role === "admin") {
      return new NextResponse("Cannot delete admin accounts", { status: 403 })
    }
    
    // Verify password
    if (!user.password) {
      return new NextResponse("Invalid password", { status: 401 })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return new NextResponse("Incorrect password", { status: 401 })
    }
    
    // Log account deletion for security
    console.log(`Account deletion initiated for user ${user.username} (${user.email}) at ${new Date().toISOString()}`)
    
    // Delete user account and all associated data (cascade)
    await prisma.user.delete({
      where: { id: session.user.id }
    })
    
    // Log successful deletion
    console.log(`Account successfully deleted for user ${user.username}`)
    
    return NextResponse.json({
      success: true,
      message: "Account deleted successfully. All data has been permanently removed.",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting account:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 