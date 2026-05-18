import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (body === null) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const res = await fetch(`${API_BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Invalid coupon code."
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data)
}
