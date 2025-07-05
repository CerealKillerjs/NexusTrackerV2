import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Request Suggest Candidate API Route
 *
 * This file handles suggesting a torrent as a candidate for a request.
 * Authenticated users can suggest torrents for open requests.
 *
 * Features:
 * - Suggest a torrent as a candidate for a request
 * - Prevent duplicate suggestions
 * - Only open requests can accept candidates
 *
 * Authentication:
 * - Requires user authentication
 */

/**
 * POST /api/request/suggest/[requestId]
 *
 * Suggests a torrent as a candidate for a request.
 *
 * @param request - NextRequest object containing candidate info
 * @param params - Route parameters containing requestId
 * @returns NextResponse with suggestion result
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
    // Fetch request to ensure it exists and is open
    const reqObj = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, status: true, candidates: true }
    })
    if (!reqObj) {
      return new NextResponse("Request not found", { status: 404 })
    }
    if (reqObj.status !== "open") {
      return new NextResponse("Request is not open for candidates", { status: 400 })
    }
    // Fetch torrent to ensure it exists
    const torrent = await prisma.torrent.findUnique({
      where: { id: torrentId },
      select: { id: true, infoHash: true, name: true }
    })
    if (!torrent) {
      return new NextResponse("Torrent not found", { status: 404 })
    }
    // Prevent duplicate suggestions
    const alreadySuggested = reqObj.candidates.some((c: any) => c.torrentId === torrent.id)
    if (alreadySuggested) {
      return new NextResponse("Torrent already suggested for this request", { status: 400 })
    }
    // Add candidate
    const newCandidate = {
      torrentId: torrent.id,
      infoHash: torrent.infoHash,
      name: torrent.name,
      suggestedBy: session.user.id,
      suggestedAt: new Date().toISOString(),
      accepted: false,
    }
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        candidates: [...reqObj.candidates, newCandidate] as any,
      },
      select: {
        id: true,
        candidates: true,
      }
    })
    // Log for audit
    console.log(`User ${session.user.username} suggested torrent ${torrent.infoHash} for request ${requestId}`)
    return NextResponse.json({
      success: true,
      candidates: updatedRequest.candidates,
      message: "Candidate suggested successfully",
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error suggesting candidate:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 