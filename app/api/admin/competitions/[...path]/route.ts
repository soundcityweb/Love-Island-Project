import { NextRequest, NextResponse } from "next/server"

const API_BASE =
  process.env.SERVER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"

const ADMIN_KEY = process.env.ADMIN_API_KEY ?? ""

/**
 * Catch-all proxy for all /api/admin/competitions/* routes.
 *
 * Handles:
 *   GET    /api/admin/competitions/:id
 *   GET    /api/admin/competitions/:id/winners
 *   POST   /api/admin/competitions                         — create
 *   PATCH  /api/admin/competitions/:id                     — update
 *   PATCH  /api/admin/competitions/:id/status              — status change
 *   DELETE /api/admin/competitions/:id                     — delete
 *   POST   /api/admin/competitions/:id/winners/select
 *   POST   /api/admin/competitions/winners/process
 */
async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const segment = path.join("/")
  const searchParams = new URL(req.url).searchParams.toString()
  const upstream = `${API_BASE}/api/admin/competitions/${segment}${searchParams ? `?${searchParams}` : ""}`

  const headers = new Headers()
  headers.set("x-admin-key", ADMIN_KEY)

  const contentType = req.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text()
  }

  try {
    const res = await fetch(upstream, init)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { message: "Could not reach the competitions admin service." },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(req, path)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(req, path)
}
