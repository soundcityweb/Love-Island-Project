import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/**
 * PATCH /api/admin/orders/:orderNumber/ship
 *
 * Proxies to the NestJS admin ship endpoint.
 * Only succeeds if the order has status = PAID.
 *
 * Response: { orderId, orderNumber, shippedAt }
 */
export async function PATCH(
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
      `${API_BASE}/api/admin/orders/${encodeURIComponent(orderNumber)}/ship`,
      {
        method: "PATCH",
        headers: { "X-Admin-Key": ADMIN_KEY },
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
