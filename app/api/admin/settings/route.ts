import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/lib/auth"

// Helper to check if user is admin
async function isAdmin() {
  const session = await auth()
  return session?.user?.role === 'ADMIN'
}

// GET: Return all configuration as key-value pairs
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const configs = await prisma.configuration.findMany()
  const configObj = Object.fromEntries(configs.map((c: { key: string, value: string }) => [c.key, c.value]))
  return NextResponse.json({ config: configObj })
}

// POST: Update or create configuration values
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const body = await request.json()
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const updates = Object.entries(body)
  const results = []
  for (const [key, value] of updates) {
    const updated = await prisma.configuration.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
    results.push({ key, value: updated.value })
  }
  return NextResponse.json({ updated: results })
} 