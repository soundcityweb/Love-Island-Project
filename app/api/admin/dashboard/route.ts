import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

export async function GET() {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
  }
  try {
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg =
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Dashboard request failed."
      return NextResponse.json({ message: msg }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { message: "Could not reach the dashboard service." },
      { status: 503 },
    )
  }
}
