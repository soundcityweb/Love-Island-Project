import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/app/lib/api-server"

const API_BASE = getApiBaseUrl()
const ADMIN_KEY = process.env.ADMIN_API_KEY

export async function GET(req: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
  }
  const q = req.nextUrl.searchParams.toString()
  const url = `${API_BASE}/api/admin/contact-messages/export/csv${q ? `?${q}` : ""}`
  try {
    const res = await fetch(url, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const msg =
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Export failed."
      return NextResponse.json({ message: msg }, { status: res.status })
    }
    const text = await res.text()
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="contact-messages.csv"',
      },
    })
  } catch {
    return NextResponse.json({ message: "Service unavailable." }, { status: 503 })
  }
}
