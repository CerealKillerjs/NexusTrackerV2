import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"
import speakeasy from "speakeasy"
import qrcode from "qrcode"

/**
 * TOTP Secret Generation API Route
 * 
 * This file handles the generation of TOTP (Time-based One-Time Password) secrets
 * for two-factor authentication setup.
 * 
 * Features:
 * - Generate TOTP secrets
 * - Create QR codes for authenticator apps
 * - Secure secret storage
 * - 2FA setup workflow
 * 
 * Authentication:
 * - Requires user authentication
 * - Users can only generate secrets for their own account
 * - Prevents duplicate 2FA setup
 */

/**
 * GET /api/account/totp/generate
 * 
 * Generates a new TOTP secret and QR code for two-factor authentication setup.
 * This is the first step in enabling 2FA for a user account.
 * 
 * Features:
 * - Generate cryptographically secure TOTP secret
 * - Create QR code for authenticator apps
 * - Store secret temporarily for verification
 * - Prevent duplicate 2FA setup
 * 
 * @param request - NextRequest object
 * @returns NextResponse with TOTP secret and QR code
 */
export async function GET() {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Fetch current user to check 2FA status
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
    
    // Generate new TOTP secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${envs.SQ_SITE_NAME}: ${user.username}`,
      issuer: envs.SQ_SITE_NAME,
    })
    
    // Generate QR code URL
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `${envs.SQ_SITE_NAME}: ${user.username}`,
      issuer: envs.SQ_SITE_NAME,
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    })
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl)
    
    // Store the secret temporarily (will be enabled after verification)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totpSecret: secret.base32,
      }
    })
    
    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qr: qrCodeDataUrl,
      otpauthUrl,
      message: "TOTP secret generated successfully. Scan the QR code with your authenticator app.",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error generating TOTP secret:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 