import type { Metadata } from "next"
import { ProductsTable, type MerchProduct } from "@/components/admin/products-table"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

export const metadata: Metadata = {
  title: "Product Management — Love Island Nigeria Admin",
}

// ----- API types (raw shape from GET /api/admin/products) ----- //

interface AdminProductImageApi {
  id: string
  url: string
  sortOrder: number
}

interface AdminProductApi {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: string
  currency: string
  categoryId: string | null
  category: { id: string; name: string } | null
  stock: number
  lowStockThreshold: number
  isActive: boolean
  images: AdminProductImageApi[]
}

// ----- Data fetching ----- //

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchAdminProducts(): Promise<MerchProduct[]> {
  if (!ADMIN_KEY) return []

  try {
    const res = await fetch(`${API_BASE}/api/admin/products`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return []

    const data = (await res.json()) as AdminProductApi[]
    if (!Array.isArray(data)) return []

    return data.map((p): MerchProduct => {
      const sorted = (p.images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)
      const resolvedImages = sorted.map((img) => img.url)

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? "",
        price: parseFloat(p.basePrice) || 0,
        category: p.category?.name ?? "",
        categoryId: p.categoryId ?? null,
        image: resolvedImages[0] ?? "/placeholder.svg",
        images: resolvedImages,
        status: p.isActive ? "Active" : "Inactive",
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold ?? 5,
        sold: 0,
      }
    })
  } catch {
    return []
  }
}

// ----- Page ----- //

export default async function AdminProductsPage() {
  const products = await fetchAdminProducts()

  return (
    <AdminPageWrapper
      title="Product Management"
      description="Manage merchandise listings, inventory, and pricing for the Love Island Nigeria official store."
      breadcrumb={[
        { label: "Admin",       href: "/admin"        },
        { label: "Merch Store"                        },
      ]}
      noPadding
    >
      <ProductsTable initialProducts={products} />
    </AdminPageWrapper>
  )
}
