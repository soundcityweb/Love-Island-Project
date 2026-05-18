import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.email !== "string") {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  try {
    const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Could not reach the server. Please try again." }, { status: 503 })
  }
}
