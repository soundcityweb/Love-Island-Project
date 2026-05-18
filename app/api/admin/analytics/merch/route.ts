import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

export async function GET(request: Request) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") ?? "monthly"

  const res = await fetch(
    `${API_BASE}/api/admin/dashboard/analytics/merch?period=${encodeURIComponent(period)}`,
    {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  return NextResponse.json(data)
}
