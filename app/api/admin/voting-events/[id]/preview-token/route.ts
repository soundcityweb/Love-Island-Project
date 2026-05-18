import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/** POST /api/admin/voting-events/:id/preview-token — mint draft preview token (proxy). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { message: "Admin API is not configured." },
      { status: 500 },
    )
  }

  const { id } = await params
  const res = await fetch(`${API_BASE}/api/admin/voting-events/${id}/preview-token`, {
    method: "POST",
    headers: {
      "X-Admin-Key": ADMIN_KEY,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : "Failed to create preview token"
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data)
}
