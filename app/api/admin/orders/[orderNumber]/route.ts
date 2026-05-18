import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/**
 * GET /api/admin/orders/:orderNumber
 *
 * Proxies to the NestJS admin order detail endpoint.
 * Returns full order details including customer PII and shipping address.
 *
 * Response: AdminOrderDetailResult
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin key not configured." }, { status: 503 })
  }

  const { orderNumber } = await params

  let res: Response
  try {
    res = await fetch(
      `${API_BASE}/api/admin/orders/${encodeURIComponent(orderNumber)}`,
      {
        headers: { "X-Admin-Key": ADMIN_KEY },
        cache: "no-store",
      },
    )
  } catch {
    return NextResponse.json(
      { message: "Could not reach the orders service." },
      { status: 503 },
    )
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.ok ? 200 : res.status })
}
