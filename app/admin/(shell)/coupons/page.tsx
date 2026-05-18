import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { CouponsManager } from "@/components/admin/coupons-manager"

export const metadata: Metadata = {
  title: "Coupon Management — Love Island Nigeria Admin",
}

export interface CouponItem {
  id: string
  code: string
  discountType: "percentage" | "flat"
  discountValue: string
  minOrderAmount: string | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchCoupons(): Promise<CouponItem[]> {
  if (!ADMIN_KEY) return []
  try {
    const res = await fetch(`${API_BASE}/api/admin/coupons`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default async function AdminCouponsPage() {
  const coupons = await fetchCoupons()

  return (
    <AdminPageWrapper
      title="Discount & Promo Codes"
      description="Create and manage coupon codes for marketing campaigns. Codes are case-insensitive and validated at checkout."
      breadcrumb={[
        { label: "Admin",   href: "/admin"   },
        { label: "Coupons"                   },
      ]}
      noPadding
    >
      <CouponsManager initialCoupons={coupons} />
    </AdminPageWrapper>
  )
}
