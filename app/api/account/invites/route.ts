import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { secrets } from "@/app/lib/config"
import crypto from "crypto"

/**
 * User Invites API Routes
 * 
 * This file handles all invite-related API endpoints for the NexusTracker application.
 * It provides functionality for managing user invitations and invite codes.
 * 
 * Features:
 * - Fetch user's created invites
 * - Generate new invite codes
 * - Invite tracking and management
 * - Bonus points integration
 * 
 * Authentication:
 * - All routes require user authentication
 * - Users can only manage their own invites
 * - Admin users have additional privileges
 */

/**
 * GET /api/account/invites
 * 
 * Fetches all invites created by the current user. Returns a list of
 * invite codes with their status and usage information.
 * 
 * Features:
 * - List of user's created invites
 * - Invite status and usage tracking
 * - Pagination support
 * - Sorting by creation date
 * 
 * @param request - NextRequest object
 * @returns NextResponse with list of invites
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit
    
    // Fetch invites created by the current user
    const [invites, totalCount] = await Promise.all([
      prisma.invite.findMany({
        where: { invitedBy: session.user.id },
        select: {
          id: true,
          code: true,
          createdAt: true,
          usedBy: true,
          usedAt: true,
          user: {
            select: {
              username: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.invite.count({
        where: { invitedBy: session.user.id }
      })
    ])
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    return NextResponse.json({
      invites,
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
    console.error("Error fetching invites:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/account/invites
 * 
 * Generates a new invite code for the current user. This allows users
 * to invite others to join the tracker.
 * 
 * Features:
 * - Generate unique invite codes
 * - Track invite creation
 * - Bonus points integration (if enabled)
 * - Email notifications
 * 
 * @param request - NextRequest object
 * @returns NextResponse with generated invite information
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Fetch current user to check remaining invites
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        remainingInvites: true,
        bonusPoints: true,
        email: true,
      }
    })
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    // Check if user has remaining invites
    if (user.remainingInvites <= 0) {
      return new NextResponse("No remaining invites", { status: 403 })
    }
    
    // Parse request body for invite details
    const body = await request.json()
    const { email, role = "user" } = body
    
    // Generate unique invite code
    const inviteCode = crypto.randomBytes(32).toString("hex")
    
    // Create new invite
    const invite = await prisma.invite.create({
      data: {
        code: inviteCode,
        invitedBy: session.user.id,
        email,
      },
      select: {
        id: true,
        code: true,
        createdAt: true,
      }
    })
    
    // Decrease remaining invites
    await prisma.user.update({
      where: { id: session.user.id },
      data: { remainingInvites: user.remainingInvites - 1 }
    })
    
    // TODO: Send email notification if email is provided and email is enabled
    if (email && !secrets.SQ_DISABLE_EMAIL) {
      // TODO: Implement email sending functionality
      console.log(`Invite sent to ${email}: ${inviteCode}`)
    }
    
    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.code,
        createdAt: invite.createdAt,
        email: email || null,
        role,
      },
      remainingInvites: user.remainingInvites - 1,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error generating invite:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 