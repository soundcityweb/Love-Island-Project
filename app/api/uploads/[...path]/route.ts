/**
 * Image proxy: GET /api/uploads/[...path]
 *
 * Forwards requests to the NestJS API's /uploads/** static file server.
 * This allows next/image to optimise API-served files without hitting
 * Next.js's private-IP block (localhost resolves to 127.0.0.1 / ::1).
 */

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const upstream = `${API_BASE}/uploads/${path.join("/")}`

  let res: Response
  try {
    res = await fetch(upstream, { cache: "force-cache" })
  } catch {
    return new Response(null, { status: 502 })
  }

  if (!res.ok) {
    return new Response(null, { status: res.status })
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream"

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
