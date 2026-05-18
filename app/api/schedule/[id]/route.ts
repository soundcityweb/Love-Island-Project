import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

type Ctx = { params: Promise<{ id: string }> }

function proxyError(data: unknown, status: number) {
  const msg = typeof (data as { message?: string }).message === "string"
    ? (data as { message: string }).message : "Request failed."
  return NextResponse.json({ message: msg }, { status })
}

/** Proxies PATCH to Nest `PATCH /api/schedule/:id`. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  try {
    const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Could not reach the schedule service." }, { status: 503 })
  }
}

/** Proxies DELETE to Nest `DELETE /api/schedule/:id`. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  try {
    const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
      method: "DELETE",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return proxyError(data, res.status)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Could not reach the schedule service." }, { status: 503 })
  }
}
