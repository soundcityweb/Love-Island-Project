import { NextResponse, type NextRequest } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.toString()
  try {
    const res = await fetch(`${API_BASE}/api/articles${query ? `?${query}` : ""}`, {
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Could not reach the articles service." }, { status: 503 })
  }
}
