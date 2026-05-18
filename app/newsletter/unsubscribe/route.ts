import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

/**
 * Unsubscribe entrypoint outside `/api/*` so production proxies that forward `/api` to Nest
 * still hit this Next handler (redirect + human-friendly /news result).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.redirect(new URL("/news", req.url))
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/newsletter/unsubscribe?${new URLSearchParams({ token }).toString()}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    )
    if (res.ok) {
      return NextResponse.redirect(new URL("/news?unsubscribed=1", req.url))
    }
  } catch {
    /* fall through */
  }

  return NextResponse.redirect(new URL("/news?unsubscribe_error=1", req.url))
}
