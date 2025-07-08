import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * GET /api/admin/users
 * 
 * Retrieves a paginated list of users with filtering and search capabilities
 * Only accessible by administrators
 * 
 * @param request - NextRequest object with query parameters
 * @returns NextResponse with users list and pagination info
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Validate pagination parameters
    const validPage = Math.max(1, page)
    const validLimit = Math.min(100, Math.max(1, limit))
    const offset = (validPage - 1) * validLimit

    // Build where clause for filtering
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Role filter
    if (role && role !== 'all') {
      where.role = role
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // Get users with pagination and sorting
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        uploaded: true,
        downloaded: true,
        passkey: true,
        emailVerified: true,
        availableInvites: true,
        _count: {
          select: {
            torrents: true, // Count of uploaded torrents
            createdInvites: true // Count of created invites
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: offset,
      take: validLimit
    })

    // Calculate ratio and format data
    const formattedUsers = await Promise.all(users.map(async (user: any) => {
      const uploaded = user.uploaded || BigInt(0)
      const downloaded = user.downloaded || BigInt(0)
      const ratio = downloaded > BigInt(0) ? Number(uploaded) / Number(downloaded) : 0

      // Get invitation statistics for this user
      const now = new Date()
      const [activeInvites, usedInvites, expiredInvites] = await Promise.all([
        // Active invites (not used, not expired, active)
        prisma.inviteCode.count({
          where: {
            createdBy: user.id,
            isActive: true,
            usedBy: null,
            expiresAt: { gt: now }
          }
        }),
        // Used invites
        prisma.inviteCode.count({
          where: {
            createdBy: user.id,
            usedBy: { not: null }
          }
        }),
        // Expired invites (not used, expired)
        prisma.inviteCode.count({
          where: {
            createdBy: user.id,
            usedBy: null,
            expiresAt: { lte: now }
          }
        })
      ])

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        uploaded: uploaded.toString(),
        downloaded: downloaded.toString(),
        ratio,
        passkey: user.passkey,
        isEmailVerified: !!user.emailVerified,
        uploadCount: user._count.torrents,
        downloadCount: 0, // TODO: Implement download count tracking
        availableInvites: user.availableInvites
      }
    }))

    // Calculate pagination info
    const totalPages = Math.ceil(total / validLimit)
    const hasNext = validPage < totalPages
    const hasPrev = validPage > 1

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 