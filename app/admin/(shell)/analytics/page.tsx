import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { MerchAnalyticsDashboard } from "@/components/admin/merch-analytics-dashboard"

export const metadata: Metadata = {
  title: "Merch Analytics — Love Island Nigeria Admin",
}

export interface MerchAnalyticsData {
  period: "daily" | "weekly" | "monthly"
  totalRevenue: number
  totalOrders: number
  ordersByStatus: Record<string, number>
  revenueOverTime: Array<{ date: string; revenue: number; orders: number }>
  topProducts: Array<{ productId: string; name: string; unitsSold: number; revenue: number }>
  lowStockProducts: Array<{ id: string; name: string; stock: number; lowStockThreshold: number }>
}

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchMerchAnalytics(period: string): Promise<MerchAnalyticsData | null> {
  if (!ADMIN_KEY) return null
  try {
    const res = await fetch(
      `${API_BASE}/api/admin/dashboard/analytics/merch?period=${encodeURIComponent(period)}`,
      { headers: { "X-Admin-Key": ADMIN_KEY }, cache: "no-store" },
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period = "monthly" } = await searchParams
  const validPeriod =
    period === "daily" || period === "weekly" || period === "monthly" ? period : "monthly"

  const analytics = await fetchMerchAnalytics(validPeriod)

  return (
    <AdminPageWrapper
      title="Merch Analytics"
      description="Revenue, top-selling products, and inventory insights."
      breadcrumb={[
        { label: "Admin",     href: "/admin"     },
        { label: "Analytics"                     },
      ]}
      noPadding
    >
      <MerchAnalyticsDashboard
        analytics={analytics}
        currentPeriod={validPeriod as "daily" | "weekly" | "monthly"}
      />
    </AdminPageWrapper>
  )
}
