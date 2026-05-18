import { NextResponse, type NextRequest } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function proxyError(data: unknown, status: number) {
  const msg = typeof (data as { message?: string }).message === "string"
    ? (data as { message: string }).message
    : "Request failed."
  return NextResponse.json({ message: msg }, { status })
}

/** Proxies GET to Nest `GET /api/schedule` (public listings). */
export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.toString()
  try {
    const res = await fetch(`${API_BASE}/api/schedule${query ? `?${query}` : ""}`, {
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Could not reach the schedule service." }, { status: 503 })
  }
}

/** Proxies POST to Nest `POST /api/schedule`. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  try {
    const res = await fetch(`${API_BASE}/api/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Could not reach the schedule service." }, { status: 503 })
  }
}
