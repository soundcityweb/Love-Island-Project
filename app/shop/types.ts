import { resolveProductImageUrl } from "@/lib/resolve-product-image-url"

/**
 * Product as used on the store listing page.
 */
export interface Product {
  id: string
  slug: string
  name: string
  price: number
  currency: string
  image: string
  category: string
  badge?: string
  inStock: boolean
}

/**
 * Full product detail as used on the product detail page.
 */
export interface ProductDetail {
  id: string
  slug: string
  name: string
  price: number
  currency: string
  image: string
  images: string[]
  category: string
  description: string
  badge?: string
  inStock: boolean
}

/** Raw product list item from GET /api/products */
export interface ProductListItemApi {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: string
  currency: string
  category: string
  imageUrl: string | null
  inStock: boolean
}

/** Raw product detail from GET /api/products/:slug */
export interface ProductDetailApi {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: string
  currency: string
  category: string
  inStock: boolean
  images: string[]
}

const getApiBase = (): string =>
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

/**
 * Fetch all active categories from the backend. Use in server components only.
 */
export async function fetchCategories(): Promise<CategoryOption[]> {
  const base = getApiBase()
  try {
    const res = await fetch(`${base}/api/categories`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Fetch active products from the backend. Use in server components only.
 */
export async function fetchActiveProducts(categorySlug?: string): Promise<Product[]> {
  const base = getApiBase()
  const url = categorySlug
    ? `${base}/api/products?category=${encodeURIComponent(categorySlug)}`
    : `${base}/api/products`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return []
  const data = (await res.json()) as ProductListItemApi[]
  if (!Array.isArray(data)) return []

  return data.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: parseFloat(p.basePrice) || 0,
    currency: p.currency,
    image: resolveProductImageUrl(p.imageUrl),
    category: p.category,
    inStock: p.inStock ?? true,
  }))
}

/**
 * Fetch a single active product by slug. Returns null when not found (404).
 * Use in server components only.
 */
export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  const base = getApiBase()
  const res = await fetch(`${base}/api/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) return null

  const p = (await res.json()) as ProductDetailApi
  const resolvedImages = (p.images ?? []).map((url) => resolveProductImageUrl(url))
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: parseFloat(p.basePrice) || 0,
    currency: p.currency,
    image: resolvedImages[0] ?? "/placeholder.svg",
    images: resolvedImages,
    category: p.category,
    description: p.description ?? "",
    inStock: p.inStock,
  }
}
