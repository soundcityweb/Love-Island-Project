import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

/**
 * GET /api/orders/:orderNumber
 *
 * Proxies to the NestJS backend to fetch an order by its order number.
 * Used by the checkout success page to verify payment status server-side.
 *
 * Response mirrors OrderDetailResult from the backend:
 * {
 *   orderId: string
 *   orderNumber: string
 *   status: 'pending' | 'paid' | 'failed' | 'shipped' | 'cancelled'
 *   totalAmount: string
 *   currency: string
 *   createdAt: string
 *   customerFirstName: string
 *   customerLastName: string
 *   items: Array<{ productId, productName, priceSnapshot, quantity }>
 * }
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params

  if (!orderNumber) {
    return NextResponse.json({ message: "Missing order number." }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(
      `${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}`,
      { cache: "no-store" },
    )
  } catch {
    return NextResponse.json(
      { message: "Could not reach the order service." },
      { status: 503 },
    )
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.ok ? 200 : res.status })
}
