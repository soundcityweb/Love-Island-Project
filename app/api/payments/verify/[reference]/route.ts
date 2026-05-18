import { NextResponse } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

/**
 * GET /api/payments/verify/:reference
 *
 * Proxies to the NestJS backend to verify a Paystack transaction.
 * Called by the /shop/checkout/callback page after Paystack redirects the user.
 *
 * Response:
 * {
 *   status: string        — 'success' | 'failed' | 'abandoned' | 'pending' | 'error'
 *   orderId?: string
 *   orderNumber?: string
 * }
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params

  if (!reference) {
    return NextResponse.json({ status: "error", message: "Missing reference." }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(
      `${API_BASE}/api/payments/verify/${encodeURIComponent(reference)}`,
      { cache: "no-store" },
    )
  } catch {
    return NextResponse.json(
      { status: "error", message: "Could not reach the payment service." },
      { status: 503 },
    )
  }

  const data = await res.json().catch(() => ({ status: "error" }))
  return NextResponse.json(data, { status: res.ok ? 200 : res.status })
}
