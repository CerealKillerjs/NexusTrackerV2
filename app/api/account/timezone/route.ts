import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Timezone Management API Route
 * 
 * This file handles timezone preferences for user accounts.
 * It allows users to set their preferred timezone for date/time display.
 * 
 * Features:
 * - Update user timezone preference
 * - Timezone validation
 * - User preference management
 * - Last seen feature integration
 * 
 * Authentication:
 * - Requires user authentication
 * - Users can only update their own timezone
 * - Validates timezone format
 */

/**
 * POST /api/account/timezone
 * 
 * Updates the current user's timezone preference. This affects how
 * dates and times are displayed throughout the application.
 * 
 * Features:
 * - Timezone preference update
 * - IANA timezone validation
 * - User preference persistence
 * - Last seen feature integration
 * 
 * @param request - NextRequest object containing timezone data
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
    const { timezone } = body
    
    // Validate required fields
    if (!timezone) {
      return new NextResponse("Request must include timezone", { status: 400 })
    }
    
    // Validate timezone format (basic IANA timezone validation)
    const validTimezonePattern = /^[A-Za-z_]+(\/[A-Za-z_]+)*$/
    if (!validTimezonePattern.test(timezone)) {
      return new NextResponse("Invalid timezone format. Please use IANA timezone format (e.g., 'Europe/Paris', 'America/New_York')", { status: 400 })
    }
    
    // Common valid timezones for additional validation
    const commonTimezones = [
      'UTC', 'GMT', 'EST', 'CST', 'MST', 'PST',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
    ]
    
    // Allow common timezones or any IANA format
    if (!commonTimezones.includes(timezone) && !timezone.includes('/')) {
      return new NextResponse("Please use a valid IANA timezone format", { status: 400 })
    }
    
    // Update user's timezone preference
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        timezone,
        lastSeen: new Date(), // Update last seen when user makes changes
      }
    })
    
    return NextResponse.json({
      success: true,
      timezone,
      message: "Timezone updated successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error updating timezone:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * GET /api/account/timezone
 * 
 * Fetches the current user's timezone preference.
 * 
 * @param request - NextRequest object
 * @returns NextResponse with current timezone
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Fetch current user's timezone
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        timezone: true,
      }
    })
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }
    
    return NextResponse.json({
      timezone: user.timezone || 'UTC',
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching timezone:", error)
    
    // Return error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 