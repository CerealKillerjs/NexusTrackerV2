import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const ALLOWED_TYPES = {
  logo: ["image/png", "image/jpeg", "image/svg+xml"],
  favicon: ["image/png", "image/x-icon", "image/svg+xml"]
}
const MAX_SIZE = {
  logo: 2 * 1024 * 1024, // 2MB
  favicon: 512 * 1024 // 512KB
}
const UPLOAD_DIR = path.join(process.cwd(), "public", "branding")

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const type = formData.get("type") as string
  const file = formData.get("file") as File

  if (!type || !file || !(type in ALLOWED_TYPES)) {
    return NextResponse.json({ error: "Invalid upload type or file" }, { status: 400 })
  }
  // Type narrowing for TypeScript
  const allowedType = type as "logo" | "favicon"
  if (!ALLOWED_TYPES[allowedType].includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }
  if (file.size > MAX_SIZE[allowedType]) {
    return NextResponse.json({ error: `File too large (max ${MAX_SIZE[allowedType] / 1024}KB)` }, { status: 400 })
  }

  // Ensure upload dir exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  // Determine file extension
  let ext = ""
  if (file.type === "image/png") ext = ".png"
  else if (file.type === "image/jpeg") ext = ".jpg"
  else if (file.type === "image/svg+xml") ext = ".svg"
  else if (file.type === "image/x-icon") ext = ".ico"
  else ext = ""

  const filename = `${type}${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filepath, buffer)

  // Return public URL
  const url = `/branding/${filename}`
  return NextResponse.json({ url })
} 