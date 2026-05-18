import { NextResponse } from "next/server"
import { getApiBaseUrl } from "@/app/lib/api-server"

const API_BASE = getApiBaseUrl()
const ADMIN_KEY = process.env.ADMIN_API_KEY

export async function GET() {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
  }
  try {
    const res = await fetch(`${API_BASE}/api/admin/contact-messages/analytics`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg =
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Request failed."
      return NextResponse.json({ message: msg }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: "Service unavailable." }, { status: 503 })
  }
}
