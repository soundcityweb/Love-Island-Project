import { NextRequest, NextResponse } from "next/server"

/**
 * Legacy path from older emails. Proxies strip /api to Nest — keep a 302 to the canonical
 * Next route so local dev and any non-proxied setups still work.
 */
export async function GET(req: NextRequest) {
  const u = new URL(req.url)
  const dest = new URL("/newsletter/unsubscribe", u.origin)
  const token = u.searchParams.get("token")
  if (token) dest.searchParams.set("token", token)
  return NextResponse.redirect(dest, 302)
}
