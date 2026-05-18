import { NextRequest, NextResponse } from "next/server"
import { getApiBaseUrl } from "@/app/lib/api-server"

const API_BASE = getApiBaseUrl()

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 })
  }

  const headers: Record<string, string> = {}
  const xf = req.headers.get("x-forwarded-for")
  if (xf) headers["x-forwarded-for"] = xf
  const realIp = req.headers.get("x-real-ip")
  if (realIp && !xf) headers["x-forwarded-for"] = realIp

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      body: formData,
      headers,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      // Upstream 404 almost always means Nest has no /api/contact (old build / module not loaded)
      // or SERVER_API_URL points at the wrong host (must be the Nest origin, not this Next app).
      if (res.status === 404) {
        return NextResponse.json(
          {
            message:
              `Contact API not found on ${API_BASE} (404). Start or restart the Nest API with the Contact module, run pending migrations, and set web/.env SERVER_API_URL to the Nest base URL (e.g. http://localhost:3000) — not the Next.js port.`,
          },
          { status: 502 },
        )
      }
      const msg = formatNestMessage(data, res.status)
      return NextResponse.json({ message: msg }, { status: res.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const dev = process.env.NODE_ENV === "development"
    const cause = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        message: dev
          ? `Could not reach the API (${API_BASE}): ${cause}`
          : "Service temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    )
  }
}

function formatNestMessage(data: unknown, status: number): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message
    if (typeof m === "string") return m
    if (Array.isArray(m)) return m.filter((x) => typeof x === "string").join(", ")
  }
  if (status === 429) return "Too many submissions. Please wait before trying again."
  return "Could not send your message."
}
