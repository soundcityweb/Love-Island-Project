import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

type Ctx = { params: Promise<{ id: string }> }

function missingKey() {
  return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
}
function proxyError(data: unknown, status: number) {
  const msg = typeof (data as { message?: string }).message === "string"
    ? (data as { message: string }).message : "Request failed."
  return NextResponse.json({ message: msg }, { status })
}

export async function PATCH(_req: Request, { params }: Ctx) {
  if (!ADMIN_KEY) return missingKey()
  const { id } = await params
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${id}/toggle-published`, {
      method: "PATCH",
      headers: { "X-Admin-Key": ADMIN_KEY },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Could not reach the schedule service." }, { status: 503 })
  }
}
