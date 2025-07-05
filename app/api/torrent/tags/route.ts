import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

/**
 * Torrent Tags API Route
 *
 * This file handles listing all unique tags used in torrents, sorted by frequency.
 *
 * Features:
 * - List all unique tags
 * - Sort tags by frequency (most used first)
 *
 * Authentication:
 * - Public route
 */

/**
 * GET /api/torrent/tags
 *
 * Returns a list of all unique tags used in torrents, sorted by frequency.
 *
 * @param request - NextRequest object
 * @returns NextResponse with tags list
 */
export async function GET() {
  try {
    // Fetch all tags from torrents
    const torrents = await prisma.torrent.findMany({
      select: { tags: true }
    })
    // Flatten and count tags
    const tagCounts: Record<string, number> = {}
    for (const torrent of torrents) {
      for (const tag of torrent.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    }
    // Convert to array and sort by frequency
    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
    return NextResponse.json({
      tags,
      total: tags.length,
    })
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching tags:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 