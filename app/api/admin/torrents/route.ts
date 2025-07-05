import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Admin Torrents Management API Routes
 *
 * This file handles admin operations on torrents.
 *
 * Features:
 * - List all torrents (admin only)
 * - Torrent management for administrators
 *
 * Authentication:
 * - Requires admin role
 */

/**
 * GET /api/admin/torrents
 *
 * Retrieves a list of all torrents for admin management.
 *
 * @param request - NextRequest object with query parameters
 * @returns NextResponse with torrent list
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (!user || user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const source = searchParams.get("source") || ""
    const freeleech = searchParams.get("freeleech")
    const isProtected = searchParams.get("protected")
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (source) {
      where.source = source
    }
    
    if (freeleech !== null) {
      where.freeleech = freeleech === "true"
    }
    
    if (isProtected !== null) {
      where.isProtected = isProtected === "true"
    }
    
    // Get torrents with pagination
    const [torrents, total] = await Promise.all([
      prisma.torrent.findMany({
        where,
        select: {
          id: true,
          infoHash: true,
          name: true,
          description: true,
          type: true,
          source: true,
          size: true,
          downloads: true,
          freeleech: true,
          isProtected: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              username: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.torrent.count({ where })
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      torrents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    })
  } catch (error) {
    console.error("Error fetching admin torrents:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 