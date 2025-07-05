import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import speakeasy from "speakeasy"

/**
 * TOTP Disable API Route
 * 
 * This file handles the disabling of TOTP (Time-based One-Time Password) for
 * two-factor authentication. Users must provide a valid TOTP token to disable 2FA.
 * 
 * Features:
 * - Verify TOTP tokens for 2FA disable
 * - Disable 2FA for user accounts
 * - Clear TOTP secrets and backup codes
 * - Security logging for 2FA removal
 * 
 * Authentication:
 * - Requires user authentication
 * - Requires valid TOTP token verification
 * - Logs 2FA disable events for security
 */

/**
 * POST /api/account/totp/disable
 * 
 * Disables two-factor authentication for the current user after verifying
 * the TOTP token from their authenticator app.
 * 
 * Features:
 * - TOTP token verification
 * - 2FA deactivation
 * - Clear TOTP data
 * - Security logging
 * 
 * @param request - NextRequest object containing TOTP token
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
    const { token } = body
    
    // Validate required fields
    if (!token) {
      return new NextResponse("Request must include token", { status: 400 })
    }
    
    // Fetch current user with TOTP data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        totpEnabled: true,
        totpSecret: true,
      }
    })
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Check if 2FA is enabled
    if (!user.totpEnabled) {
      return new NextResponse("TOTP is not enabled", { status: 409 })
    }
    
    // Check if TOTP secret exists
    if (!user.totpSecret) {
      return new NextResponse("TOTP secret not found", { status: 400 })
    }
    
    // Verify TOTP token
    const validToken = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 time step tolerance
    })
    
    if (!validToken) {
      return new NextResponse("Invalid TOTP code", { status: 400 })
    }
    
    // Disable 2FA and clear TOTP data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totpEnabled: false,
        totpSecret: null,
      }
    })
    
    // Log 2FA disable for security
    console.log(`2FA disabled for user ${session.user.username} at ${new Date().toISOString()}`)
    
    return NextResponse.json({
      success: true,
      message: "Two-factor authentication disabled successfully.",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error disabling TOTP:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 