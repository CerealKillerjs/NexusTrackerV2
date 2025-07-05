import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Freeleech Toggle API Route
 *
 * This file handles toggling the freeleech status of a torrent by info hash.
 * Only admins can toggle freeleech status.
 *
 * Features:
 * - Toggle freeleech status (true/false)
 * - Permission check for admin
 *
 * Authentication:
 * - Requires admin authentication
 */

/**
 * POST /api/torrent/toggle-freeleech/[infoHash]
 *
 * Toggles the freeleech status of a torrent. Only admins can perform this action.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing infoHash
 * @returns NextResponse with toggle result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { infoHash: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // Fetch user to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, username: true, role: true }
    })
    if (!user || user.role !== "admin") {
      return new NextResponse("You do not have permission to toggle freeleech", { status: 403 })
    }
    const { infoHash } = params
    // Fetch torrent to ensure it exists
    const torrent = await prisma.torrent.findUnique({
      where: { infoHash },
      select: { id: true, freeleech: true }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // Toggle freeleech status
    const updated = await prisma.torrent.update({
      where: { infoHash },
      data: { freeleech: !torrent.freeleech }
    })
    // Log for audit
    console.log(`Admin ${user.username} toggled freeleech for torrent ${infoHash} to ${updated.freeleech}`)
    return NextResponse.json({
      success: true,
      freeleech: updated.freeleech,
      message: `Freeleech status set to ${updated.freeleech}`,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error toggling freeleech:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 