import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/** PATCH /api/admin/voting-events/:id/open — proxy to backend with admin auth. */
export async function PATCH(
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
  const res = await fetch(`${API_BASE}/api/admin/voting-events/${id}/open`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
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
          : "Failed to open voting event"
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data)
}
