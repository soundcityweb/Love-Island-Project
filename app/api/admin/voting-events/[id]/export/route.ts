import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/** GET /api/admin/voting-events/:id/export?format=csv|xlsx — proxy file download with admin auth. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json(
      { message: "Admin API is not configured." },
      { status: 500 },
    )
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv"

  const res = await fetch(
    `${API_BASE}/api/admin/voting-events/${id}/export?format=${format}`,
    {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    },
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : "Export failed"
    return NextResponse.json({ message }, { status: res.status })
  }

  const buf = await res.arrayBuffer()
  const contentType =
    res.headers.get("Content-Type") ?? "application/octet-stream"
  const disposition =
    res.headers.get("Content-Disposition") ??
    `attachment; filename="voting-results.${format === "xlsx" ? "xlsx" : "csv"}"`

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  })
}
