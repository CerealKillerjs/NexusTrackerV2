import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { envs } from "@/app/lib/config"

/**
 * Bonus Points Purchase API Route
 * 
 * This file handles bonus points purchases for user accounts.
 * It allows users to spend bonus points on invites and upload credit.
 * 
 * Features:
 * - Purchase invites with bonus points
 * - Purchase upload credit with bonus points
 * - Transaction validation and processing
 * - Bonus points balance management
 * 
 * Authentication:
 * - All routes require user authentication
 * - Users can only spend their own bonus points
 * - Transaction logging for audit trail
 */

/**
 * POST /api/account/buy
 * 
 * Allows users to purchase items using their bonus points.
 * Currently supports purchasing invites and upload credit.
 * 
 * Features:
 * - Invite purchases
 * - Upload credit purchases
 * - Bonus points validation
 * - Transaction processing
 * 
 * @param request - NextRequest object containing purchase data
 * @returns NextResponse with transaction result
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
    const { type, amount } = body
    
    // Validate required fields
    if (!type || !amount) {
      return new NextResponse("Request must include type and amount", { status: 400 })
    }
    
    // Validate amount
    const purchaseAmount = parseInt(amount)
    if (purchaseAmount < 1) {
      return new NextResponse("Amount must be a number >= 1", { status: 400 })
    }
    
    // Fetch current user with bonus points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        bonusPoints: true,
        remainingInvites: true,
      }
    })
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    let cost = 0
    let newBonusPoints = user.bonusPoints
    let newRemainingInvites = user.remainingInvites
    
    // Process different purchase types
    if (type === "invite") {
      // Check if invite purchases are enabled
      if (envs.SQ_BP_COST_PER_INVITE === 0) {
        return new NextResponse("Invite purchases are not available", { status: 403 })
      }
      
      // Calculate cost
      cost = purchaseAmount * envs.SQ_BP_COST_PER_INVITE
      
      // Check if user has enough bonus points
      if (cost > user.bonusPoints) {
        return new NextResponse("Not enough bonus points for transaction", { status: 403 })
      }
      
      // Update user's remaining invites and bonus points
      newRemainingInvites = user.remainingInvites + purchaseAmount
      newBonusPoints = user.bonusPoints - cost
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          remainingInvites: newRemainingInvites,
          bonusPoints: newBonusPoints,
        }
      })
      
    } else if (type === "upload") {
      // Check if upload purchases are enabled
      if (envs.SQ_BP_COST_PER_GB === 0) {
        return new NextResponse("Upload purchases are not available", { status: 403 })
      }
      
      // Calculate cost
      cost = purchaseAmount * envs.SQ_BP_COST_PER_GB
      
      // Check if user has enough bonus points
      if (cost > user.bonusPoints) {
        return new NextResponse("Not enough bonus points for transaction", { status: 403 })
      }
      
      // Update user's bonus points
      newBonusPoints = user.bonusPoints - cost
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          bonusPoints: newBonusPoints,
        }
      })
      
      // TODO: Create progress record for upload credit when Progress model is implemented
      // This would track the purchased upload credit in the user's ratio
      console.log(`Upload credit purchased: ${purchaseAmount} GB for user ${session.user.username}`)
      
    } else {
      return new NextResponse("Type must be one of: invite, upload", { status: 400 })
    }
    
    // Log transaction for audit trail
    console.log(`Purchase completed: ${type} x${purchaseAmount} for user ${session.user.username}, cost: ${cost} BP`)
    
    return NextResponse.json({
      success: true,
      type,
      amount: purchaseAmount,
      cost,
      newBonusPoints,
      newRemainingInvites: type === "invite" ? newRemainingInvites : undefined,
      message: `Successfully purchased ${purchaseAmount} ${type}${purchaseAmount > 1 ? 's' : ''}`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error processing purchase:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 