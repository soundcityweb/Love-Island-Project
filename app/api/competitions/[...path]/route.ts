import { NextRequest, NextResponse } from "next/server"

const API_BASE =
  process.env.SERVER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"

/**
 * Catch-all proxy for all /api/competitions/* routes.
 *
 * Forwards GET and POST requests from Next.js client components to the
 * NestJS backend, passing through Content-Type and X-Session-Id headers.
 *
 * Handles:
 *   GET  /api/competitions/:slug/questions
 *   GET  /api/competitions/:slug/results
 *   GET  /api/competitions/:slug/winners
 *   POST /api/competitions/:slug/submit
 *   POST /api/competitions            (create — admin key passed via header)
 */
async function proxy(
  req: NextRequest,
  path: string[],
): Promise<NextResponse> {
  const segment = path.join("/")
  const searchParams = new URL(req.url).searchParams.toString()
  const upstream = `${API_BASE}/api/competitions/${segment}${searchParams ? `?${searchParams}` : ""}`

  const headers = new Headers()

  const contentType = req.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  // Forward session and admin identity headers
  const sessionId = req.headers.get("x-session-id")
  if (sessionId) headers.set("x-session-id", sessionId)

  const adminKey = req.headers.get("x-admin-key")
  if (adminKey) headers.set("x-admin-key", adminKey)

  const init: RequestInit = {
    method: req.method,
    headers,
    cache:  "no-store",
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text()
  }

  try {
    const res  = await fetch(upstream, init)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { message: "Could not reach the competitions service." },
      { status: 503 },
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(req, path)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(req, path)
}
