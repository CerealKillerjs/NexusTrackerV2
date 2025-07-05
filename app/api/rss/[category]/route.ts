import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

/**
 * Category-Specific RSS Feed API Routes
 *
 * This file handles generating RSS feeds for specific categories.
 *
 * Features:
 * - Generate RSS feed for specific categories
 * - Category-based torrent filtering
 *
 * Authentication:
 * - Public access
 */

/**
 * GET /api/rss/[category]
 *
 * Generates an RSS feed for a specific category.
 *
 * @param request - NextRequest object with query parameters
 * @param params - Route parameters containing category
 * @returns NextResponse with RSS XML
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const source = searchParams.get("source") || ""
    
    // Build where clause
    const where: any = {
      type: category
    }
    
    if (source) {
      where.source = source
    }
    
    // Get latest torrents for category
    const torrents = await prisma.torrent.findMany({
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
        createdAt: true,
        user: {
          select: {
            username: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    
    // Generate RSS XML
    const rssXml = generateRSSXML(torrents, {
      title: `NexusTracker - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Latest ${category} torrents from NexusTracker`,
      link: process.env.NEXTAUTH_URL || "http://localhost:3000",
    })
    
    // Return RSS XML with proper headers
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error("Error generating category RSS feed:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * Generates RSS XML from torrent data
 */
function generateRSSXML(torrents: any[], feedInfo: { title: string; description: string; link: string }) {
  const now = new Date().toUTCString()
  
  let items = ""
  for (const torrent of torrents) {
    const pubDate = new Date(torrent.createdAt).toUTCString()
    const sizeMB = Number(torrent.size) / (1024 * 1024)
    
    items += `
      <item>
        <title><![CDATA[${torrent.name}]]></title>
        <description><![CDATA[${torrent.description || ""}]]></description>
        <link>${feedInfo.link}/torrent/${torrent.infoHash}</link>
        <guid>${torrent.infoHash}</guid>
        <pubDate>${pubDate}</pubDate>
        <category>${torrent.type || "Other"}</category>
        <enclosure url="${feedInfo.link}/api/torrent/${torrent.infoHash}/download" length="${torrent.size}" type="application/x-bittorrent" />
        <torrent:infoHash>${torrent.infoHash}</torrent:infoHash>
        <torrent:size>${sizeMB.toFixed(2)} MB</torrent:size>
        <torrent:downloads>${torrent.downloads}</torrent:downloads>
        <torrent:uploader>${torrent.user.username}</torrent:uploader>
      </item>
    `
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:torrent="http://xmlns.ezrss.it/0.1/">
  <channel>
    <title>${feedInfo.title}</title>
    <description>${feedInfo.description}</description>
    <link>${feedInfo.link}</link>
    <lastBuildDate>${now}</lastBuildDate>
    <language>en</language>
    <generator>NexusTracker RSS Generator</generator>
    ${items}
  </channel>
</rss>`
} 