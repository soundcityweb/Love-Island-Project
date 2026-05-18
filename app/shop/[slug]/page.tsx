import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail, type ProductFull } from "@/components/shop/product-detail"
import { fetchProductBySlug } from "@/app/shop/types"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) return { title: "Product not found" }
  return {
    title: `${product.name} — Love Island Nigeria Shop`,
    description: product.description || undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)

  if (!product) notFound()

  const productFull: ProductFull = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    image: product.image,
    images: product.images,
    category: product.category,
    description: product.description,
    inStock: product.inStock,
  }

  return (
    <main className="bg-background">
      <ProductDetail product={productFull} />
    </main>
  )
}
