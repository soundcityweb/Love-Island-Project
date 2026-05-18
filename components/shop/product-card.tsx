import Image from "next/image"
import Link from "next/link"

/** Product for store listing; can be imported from @/app/shop/types for consistency. */
export interface Product {
  id: string
  slug: string
  name: string
  price: number
  image: string
  category: string
  badge?: string
  inStock?: boolean
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.inStock === false
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/35 hover:shadow-warm-lg hover:ring-2 hover:ring-primary/35 ${isOutOfStock ? "opacity-70" : ""}`}>
      {/* Out of Stock badge */}
      {isOutOfStock && (
        <span className="absolute right-3 top-3 z-20 rounded-full bg-muted px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground shadow">
          Out of Stock
        </span>
      )}
      {/* Promo badge — only show when in stock */}
      {!isOutOfStock && product.badge && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-warm">
          {product.badge}
        </span>
      )}

      {/* Image — bold, full-bleed, hover lift + glow */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={1000}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:brightness-[1.06]"
        />
        {/* Gradient overlays — depth + tropical heat */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

        {/* Micro hook on image (desktop hover) */}
        <p className="absolute bottom-4 left-4 right-4 translate-y-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/0 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-white/90 group-hover:opacity-100">
          Wear the vibe
        </p>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
          {product.category}
        </p>
        <h3 className="mt-1.5 text-lg font-black leading-snug tracking-tight text-card-foreground">
          {product.name}
        </h3>
        <p className="mt-1 text-xl font-black tabular-nums text-foreground">
          {formatPrice(product.price)}
        </p>

        <div className="mt-4">
          {isOutOfStock ? (
            <span className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted px-4 py-3 text-sm font-black uppercase tracking-wide text-muted-foreground cursor-not-allowed">
              Out of Stock
            </span>
          ) : (
            <Link
              href={`/shop/${product.slug}`}
              className="inline-flex w-full items-center justify-center rounded-full border-0 btn-gradient px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-warm transition-all hover:brightness-110"
            >
              Shop this look
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
