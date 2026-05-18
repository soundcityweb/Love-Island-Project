import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/videos`, { cache: "no-store" })
    const data = await res.json().catch(() => [])
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Could not reach the videos service." }, { status: 503 })
  }
}
