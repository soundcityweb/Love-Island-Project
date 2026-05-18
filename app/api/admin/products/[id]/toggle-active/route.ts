import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/** PATCH /api/admin/products/:id/toggle-active — flip isActive flag. */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
  }

  const { id } = await params
  const res = await fetch(`${API_BASE}/api/admin/products/${id}/toggle-active`, {
    method: "PATCH",
    headers: { "X-Admin-Key": ADMIN_KEY },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : Array.isArray((data as { message?: unknown[] }).message)
          ? (data as { message: string[] }).message.join(", ")
          : "Failed to toggle product status."
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data)
}
