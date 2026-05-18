import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

export interface CreateVotingEventBody {
  code: string
  name: string
  description?: string
  startsAt: string
  endsAt: string
}

/** POST /api/admin/voting-events — proxy to backend with admin auth. */
export async function POST(request: Request) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { message: "Admin API is not configured." },
      { status: 500 }
    )
  }

  let body: CreateVotingEventBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 }
    )
  }

  const res = await fetch(`${API_BASE}/api/admin/voting-events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": ADMIN_KEY,
    },
    body: JSON.stringify({
      code: body.code,
      name: body.name,
      ...(body.description != null && body.description !== "" && { description: body.description }),
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = typeof data.message === "string" ? data.message : Array.isArray(data.message) ? data.message.join(", ") : "Failed to create voting event"
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data)
}
