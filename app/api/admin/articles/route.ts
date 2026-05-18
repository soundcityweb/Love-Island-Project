import { NextResponse, type NextRequest } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

function missingKey() {
  return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
}
function proxyError(data: unknown, status: number) {
  const msg = typeof (data as { message?: string }).message === "string"
    ? (data as { message: string }).message
    : "Request failed."
  return NextResponse.json({ message: msg }, { status })
}

export async function GET(req: NextRequest) {
  if (!ADMIN_KEY) return missingKey()
  const query = new URL(req.url).searchParams.toString()
  try {
    const res = await fetch(`${API_BASE}/api/admin/articles${query ? `?${query}` : ""}`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Could not reach the articles service." }, { status: 503 })
  }
}

export async function POST(req: Request) {
  if (!ADMIN_KEY) return missingKey()
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  try {
    const res = await fetch(`${API_BASE}/api/admin/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Could not reach the articles service." }, { status: 503 })
  }
}
