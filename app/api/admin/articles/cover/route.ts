import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

function missingKey() {
  return NextResponse.json({ message: "Admin key not configured." }, { status: 503 })
}

function backendError(status: number, message: string) {
  return NextResponse.json({ message }, { status })
}

/**
 * POST /api/admin/articles/cover
 * Proxies multipart cover upload to Nest; returns { url: string } (Cloudinary secure URL).
 */
export async function POST(request: Request) {
  if (!ADMIN_KEY) return missingKey()

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return backendError(400, "Invalid multipart request.")
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/admin/articles/cover`, {
      method: "POST",
      headers: { "X-Admin-Key": ADMIN_KEY },
      body: formData,
    })
  } catch {
    return backendError(503, "Could not reach the API. Please try again.")
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return backendError(
      res.status,
      (data as { message?: string }).message || "Upload failed.",
    )
  }

  return NextResponse.json(data, { status: 201 })
}
