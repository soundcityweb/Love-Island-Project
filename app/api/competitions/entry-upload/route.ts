import { NextRequest, NextResponse } from "next/server"

const API_BASE =
  process.env.SERVER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"

// Re-use the admin product-images endpoint server-side so we don't need a
// separate Cloudinary integration in Next.js.  The admin key never leaves
// the server.
const ADMIN_KEY = process.env.ADMIN_API_KEY ?? ""

/**
 * POST /api/competitions/entry-upload
 *
 * Accepts a multipart/form-data request with a single `file` field.
 * Proxies the file to the NestJS upload endpoint and returns the
 * resulting public URL.
 *
 * Response: { url: string }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: "Invalid multipart request." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 })
  }

  // Validate size (50 MB)
  const MAX_BYTES = 50 * 1024 * 1024
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "File exceeds the 50 MB limit." }, { status: 413 })
  }

  // Re-package as the field name the admin endpoint expects ("images")
  const upstream = new FormData()
  upstream.append("images", file)

  try {
    const res = await fetch(`${API_BASE}/api/admin/products/images`, {
      method: "POST",
      headers: { "X-Admin-Key": ADMIN_KEY },
      body: upstream,
    })

    const data = await res.json().catch(() => ({})) as { urls?: string[]; message?: string }

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? "Upload failed. Please try again." },
        { status: res.status },
      )
    }

    const url = data.urls?.[0]
    if (!url) {
      return NextResponse.json({ message: "Upload succeeded but no URL was returned." }, { status: 502 })
    }

    return NextResponse.json({ url }, { status: 200 })
  } catch {
    return NextResponse.json(
      { message: "Could not reach the upload service. Please try again." },
      { status: 503 },
    )
  }
}
