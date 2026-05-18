import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

export async function PATCH(req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!ADMIN_KEY) return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
  const { key } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  try {
    const res = await fetch(`${API_BASE}/api/admin/landing/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch { return NextResponse.json({ message: "Service unavailable." }, { status: 503 }) }
}
