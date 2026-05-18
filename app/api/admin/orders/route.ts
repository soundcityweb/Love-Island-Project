import { NextResponse, type NextRequest } from "next/server"

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

/**
 * GET /api/admin/orders
 *
 * Proxies to the NestJS backend paginated admin orders endpoint.
 * Forwards query params: page, limit, status.
 *
 * Response: PaginatedOrders
 * {
 *   data: OrderSummary[]
 *   total: number
 *   page: number
 *   limit: number
 *   totalPages: number
 * }
 */
export async function GET(request: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ message: "Admin key not configured." }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()

  let res: Response
  try {
    res = await fetch(
      `${API_BASE}/api/admin/orders${query ? `?${query}` : ""}`,
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
