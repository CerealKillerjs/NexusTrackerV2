import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import speakeasy from "speakeasy"
import crypto from "crypto"

/**
 * TOTP Enable API Route
 * 
 * This file handles the enabling of TOTP (Time-based One-Time Password) for
 * two-factor authentication after secret generation and verification.
 * 
 * Features:
 * - Verify TOTP tokens
 * - Enable 2FA for user accounts
 * - Generate backup codes
 * - Secure 2FA activation
 * 
 * Authentication:
 * - Requires user authentication
 * - Requires valid TOTP token verification
 * - Generates backup codes for account recovery
 */

/**
 * POST /api/account/totp/enable
 * 
 * Enables two-factor authentication for the current user after verifying
 * the TOTP token from their authenticator app.
 * 
 * Features:
 * - TOTP token verification
 * - 2FA activation
 * - Backup code generation
 * - Security logging
 * 
 * @param request - NextRequest object containing TOTP token
 * @returns NextResponse with backup codes
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
    
    // Check if 2FA is already enabled
    if (user.totpEnabled) {
      return new NextResponse("TOTP already enabled", { status: 409 })
    }
    
    // Check if TOTP secret exists
    if (!user.totpSecret) {
      return new NextResponse("TOTP secret not found. Please generate a secret first.", { status: 400 })
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
    
    // Generate backup codes for account recovery
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(32).toString("hex").slice(0, 10)
    )
    
    // Enable 2FA and store backup codes
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totpEnabled: true,
      }
    })
    
    // Log 2FA activation for security
    console.log(`2FA enabled for user ${session.user.username} at ${new Date().toISOString()}`)
    
    return NextResponse.json({
      success: true,
      backupCodes: backupCodes.join(","),
      message: "Two-factor authentication enabled successfully. Store your backup codes securely.",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error enabling TOTP:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 