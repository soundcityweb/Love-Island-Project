import type { Metadata } from "next"
import { OrdersTable, type PaginatedOrders } from "@/components/admin/orders-table"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

export const metadata: Metadata = {
  title: "Order Management — Love Island Nigeria Admin",
}

// ----- Data fetching ----- //

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

const EMPTY: PaginatedOrders = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }

async function fetchAdminOrders(
  page: number,
  limit: number,
  status?: string,
): Promise<PaginatedOrders> {
  if (!ADMIN_KEY) return EMPTY

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (status) params.set("status", status)

  try {
    const res = await fetch(`${API_BASE}/api/admin/orders?${params}`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return EMPTY
    return res.json()
  } catch {
    return EMPTY
  }
}

// ----- Page ----- //

type Props = {
  searchParams: Promise<{ page?: string; limit?: string; status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { page: rawPage, status: rawStatus } = await searchParams

  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1)
  const status = rawStatus && rawStatus !== "all" ? rawStatus : undefined

  const data = await fetchAdminOrders(page, 20, status)
  const currentStatus = rawStatus ?? "all"

  return (
    <AdminPageWrapper
      title="Order Management"
      description="Track and manage all merchandise orders from the Love Island Nigeria official store."
      breadcrumb={[
        { label: "Admin",    href: "/admin"          },
        { label: "Products", href: "/admin/products" },
        { label: "Orders" },
      ]}
      noPadding
    >
      <OrdersTable
        initialData={data}
        currentStatus={currentStatus}
        currentPage={page}
      />
    </AdminPageWrapper>
  )
}
