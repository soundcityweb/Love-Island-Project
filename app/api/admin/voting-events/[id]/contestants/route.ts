import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

export interface AddContestantsBody {
  islanderIds: string[]
}

/** POST /api/admin/voting-events/:id/contestants — proxy to backend with admin auth. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { message: "Admin API is not configured." },
      { status: 500 },
    )
  }

  const { id } = await params
  let body: AddContestantsBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    )
  }

  const res = await fetch(`${API_BASE}/api/admin/voting-events/${id}/contestants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": ADMIN_KEY,
    },
    body: JSON.stringify({ islanderIds: body.islanderIds ?? [] }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : "Failed to attach contestants"
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data)
}
