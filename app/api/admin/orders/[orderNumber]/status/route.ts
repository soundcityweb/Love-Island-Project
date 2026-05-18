import { NextResponse, type NextRequest } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/**
 * PATCH /api/admin/orders/:orderNumber/status
 *
 * Proxies a general status update to the NestJS admin endpoint.
 * Body: { status: "pending" | "paid" | "failed" | "shipped" | "cancelled" }
 *
 * Response: { orderId, orderNumber, status, shippedAt }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin key not configured." }, { status: 503 })
  }

  const { orderNumber } = await params
  const body = await request.text()

  let res: Response
  try {
    res = await fetch(
      `${API_BASE}/api/admin/orders/${encodeURIComponent(orderNumber)}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": ADMIN_KEY,
        },
        body,
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
