import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

function missingKey() {
  return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
}

function backendError(data: unknown, status: number) {
  const message =
    typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : "Request failed."
  return NextResponse.json({ message }, { status })
}

export async function GET() {
  if (!ADMIN_KEY) return missingKey()
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    headers: { "X-Admin-Key": ADMIN_KEY },
    cache: "no-store",
  })
  const data = await res.json().catch(() => [])
  if (!res.ok) return backendError(data, res.status)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!ADMIN_KEY) return missingKey()
  const body = await request.json().catch(() => null)
  if (body === null) return NextResponse.json({ message: "Invalid request body." }, { status: 400 })

  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return backendError(data, res.status)
  return NextResponse.json(data, { status: 201 })
}
