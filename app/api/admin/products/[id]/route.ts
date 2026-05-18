import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

type Context = { params: Promise<{ id: string }> }

function missingKey() {
  return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
}

function backendError(data: unknown, status: number) {
  const message =
    typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : Array.isArray((data as { message?: unknown[] }).message)
        ? (data as { message: string[] }).message.join(", ")
        : "Request failed."
  return NextResponse.json({ message }, { status })
}

/** PATCH /api/admin/products/:id — partially update a product. */
export async function PATCH(request: Request, { params }: Context) {
  if (!ADMIN_KEY) return missingKey()
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (body === null) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return backendError(data, res.status)
  return NextResponse.json(data)
}

/** DELETE /api/admin/products/:id — permanently delete a product. */
export async function DELETE(_request: Request, { params }: Context) {
  if (!ADMIN_KEY) return missingKey()
  const { id } = await params

  const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": ADMIN_KEY },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return backendError(data, res.status)
  return NextResponse.json(data)
}
