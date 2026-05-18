import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

/**
 * POST /api/orders
 *
 * Proxies the order creation + payment initiation request to the NestJS backend.
 *
 * Request body (mirrors CreateOrderDto):
 * {
 *   items: Array<{ productId: string; quantity: number }>
 *   customerFirstName: string
 *   customerLastName: string
 *   customerEmail: string
 *   customerPhone?: string | null
 *   shippingAddress: string
 *   shippingCity: string
 *   shippingState: string
 * }
 *
 * Success (201):
 * {
 *   orderId: string
 *   orderNumber: string
 *   status: "pending"
 *   totalAmount: string
 *   currency: string
 *   paymentUrl: string   ← Paystack authorization URL; redirect the user here
 * }
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    return NextResponse.json(
      { message: "Could not reach the server. Please try again." },
      { status: 503 },
    )
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : "Failed to place order."
    return NextResponse.json({ message }, { status: res.status })
  }

  return NextResponse.json(data, { status: 201 })
}
