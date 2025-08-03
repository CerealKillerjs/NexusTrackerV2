/**
 * API Route for getting user avatar by ID
 * 
 * This endpoint returns the avatar image for a specific user
 * Used to avoid loading large base64 data in session
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the session to check authentication
    const session = await auth()
    

    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = id

    // Get user data including image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        image: true,
      }
    })



    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // If user has no image, return 404
    if (!user.image) {
      return NextResponse.json(
        { error: "No avatar found" },
        { status: 404 }
      )
    }

    // Return the image as base64 data
    return NextResponse.json({
      image: user.image,
      userId: user.id
    })

  } catch (error) {
    console.error("Error fetching user avatar:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 