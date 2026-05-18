import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function GET() {
  const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" })
  if (!res.ok) return NextResponse.json([], { status: res.status })
  const data = await res.json().catch(() => [])
  return NextResponse.json(data)
}
