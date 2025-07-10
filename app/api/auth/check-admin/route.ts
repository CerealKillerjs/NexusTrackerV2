import { NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * GET /api/auth/check-admin
 * 
 * Verifies if the current user has admin privileges
 * Returns a boolean indicating admin status
 * 
 * @param request - NextRequest object
 * @returns NextResponse with admin status
 */
export async function GET() {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user exists and has admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        role: true,
        username: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has admin role
    const isAdmin = user.role === 'ADMIN'

    return NextResponse.json({
      isAdmin,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error checking admin status:', error)
    
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 