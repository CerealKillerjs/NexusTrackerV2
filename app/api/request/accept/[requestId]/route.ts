import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Request Accept Candidate API Route
 *
 * This file handles accepting a candidate torrent for a request.
 * Only the request creator or an admin can accept a candidate.
 *
 * Features:
 * - Accept a candidate torrent for a request
 * - Mark request as filled
 * - Update candidate status
 * - Permission checks
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/request/accept/[requestId]
 *
 * Accepts a candidate torrent for a request, marking the request as filled.
 *
 * @param request - NextRequest object containing candidate info
 * @param params - Route parameters containing requestId
 * @returns NextResponse with accept result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const { requestId } = params
    // Parse request body
    const body = await request.json()
    const { torrentId } = body
    if (!torrentId) {
      return new NextResponse("Torrent ID is required", { status: 400 })
    }
    // Fetch request to ensure it exists
    const reqObj = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, createdBy: true, status: true, candidates: true }
    })
    if (!reqObj) {
      return new NextResponse("Request not found", { status: 404 })
    }
    // Only creator or admin can accept
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })
    if (!user || (user.id !== reqObj.createdBy && user.role !== "admin")) {
      return new NextResponse("You do not have permission to accept a candidate for this request", { status: 403 })
    }
    if (reqObj.status !== "open") {
      return new NextResponse("Request is not open for accepting candidates", { status: 400 })
    }
    // Find candidate
    const candidateIndex = reqObj.candidates.findIndex((c: any) => c.torrentId === torrentId)
    if (candidateIndex === -1) {
      return new NextResponse("Candidate not found for this request", { status: 404 })
    }
    // Mark candidate as accepted
    const updatedCandidates = reqObj.candidates.map((c: any, i: number) =>
      i === candidateIndex ? { ...c, accepted: true, acceptedAt: new Date().toISOString() } : c
    )
    // Update request status and candidates
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: "filled",
        candidates: { set: updatedCandidates },
      },
      select: {
        id: true,
        status: true,
        candidates: true,
      }
    })
    // Log for audit
    console.log(`Request ${requestId} filled with candidate torrent ${torrentId}`)
    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: "Candidate accepted and request marked as filled",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error accepting candidate:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 