import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { CategoriesManager } from "@/components/admin/categories-manager"

export const metadata: Metadata = {
  title: "Category Management — Love Island Nigeria Admin",
}

export interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchCategories(): Promise<CategoryItem[]> {
  if (!ADMIN_KEY) return []
  try {
    const res = await fetch(`${API_BASE}/api/admin/categories`, {
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

export default async function AdminCategoriesPage() {
  const categories = await fetchCategories()

  return (
    <AdminPageWrapper
      title="Product Categories"
      description="Manage product categories. These are used to organise products and power the shop filter."
      breadcrumb={[
        { label: "Admin",      href: "/admin"      },
        { label: "Categories"                      },
      ]}
      noPadding
    >
      <CategoriesManager initialCategories={categories} />
    </AdminPageWrapper>
  )
}
