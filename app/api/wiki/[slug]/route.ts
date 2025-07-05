import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

/**
 * Wiki Page API Route
 *
 * This file handles fetching, creating/editing, and deleting wiki pages by slug.
 *
 * Features:
 * - Get a wiki page by slug
 * - Create or edit a wiki page (authenticated)
 * - Delete a wiki page (admin/moderator only)
 * - Revision history
 *
 * Authentication:
 * - Public for GET
 * - Authenticated for POST
 * - Admin/moderator for DELETE
 */

/**
 * GET /api/wiki/[slug]
 *
 * Fetches a wiki page by slug.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing slug
 * @returns NextResponse with wiki page data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const page = await prisma.wikiPage.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, username: true } },
        revisions: true,
      }
    })
    if (!page) {
      return new NextResponse("Wiki page not found", { status: 404 })
    }
    return NextResponse.json({ page })
  } catch (error) {
    console.error("Error fetching wiki page:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST /api/wiki/[slug]
 *
 * Creates or edits a wiki page. Requires authentication.
 *
 * @param request - NextRequest object containing page data
 * @param params - Route parameters containing slug
 * @returns NextResponse with result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const { slug } = params
    const body = await request.json()
    const { title, content } = body
    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 })
    }
    // Check if page exists
    const existing = await prisma.wikiPage.findUnique({ where: { slug } })
    let page
    if (existing) {
      // Add revision
      const newRevision = {
        title: existing.title,
        content: existing.content,
        updatedAt: existing.updatedAt,
        updatedBy: existing.createdBy,
      }
      page = await prisma.wikiPage.update({
        where: { slug },
        data: {
          title,
          content,
          updatedAt: new Date(),
          revisions: [...existing.revisions, newRevision] as any,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          updatedAt: true,
          revisions: true,
        }
      })
    } else {
      page = await prisma.wikiPage.create({
        data: {
          slug,
          title,
          content,
          createdBy: session.user.id,
          revisions: [],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          createdAt: true,
          revisions: true,
        }
      })
    }
    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error("Error creating/editing wiki page:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * DELETE /api/wiki/[slug]
 *
 * Deletes a wiki page. Only admin or moderator can delete.
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing slug
 * @returns NextResponse with result
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // Fetch user to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return new NextResponse("Forbidden", { status: 403 })
    }
    const { slug } = params
    // Check if page exists
    const existing = await prisma.wikiPage.findUnique({ where: { slug } })
    if (!existing) {
      return new NextResponse("Wiki page not found", { status: 404 })
    }
    await prisma.wikiPage.delete({ where: { slug } })
    return NextResponse.json({ success: true, message: "Wiki page deleted" })
  } catch (error) {
    console.error("Error deleting wiki page:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 