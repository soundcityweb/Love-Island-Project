import type { Metadata } from "next"
import Link from "next/link"
import { ProductCard } from "@/components/shop/product-card"
import { fetchActiveProducts, fetchCategories } from "./types"

export const metadata: Metadata = {
  title: "Shop the Villa - Official Merch | Love Island Nigeria",
  description:
    "Wear the energy of the villa. Official Love Island Nigeria apparel, accessories, and lifestyle pieces for true fans.",
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categorySlug } = await searchParams
  const [products, categories] = await Promise.all([
    fetchActiveProducts(categorySlug),
    fetchCategories(),
  ])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero — lifestyle, tropical energy */}
      <section className="relative overflow-hidden px-4 pb-12 pt-20 md:px-8 lg:px-12 lg:pb-16 lg:pt-28">
        <div className="absolute inset-0 bg-li-sunset" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

        <div className="relative mx-auto max-w-7xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;Official Merch &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
            Shop the Villa
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 md:text-xl">
            This isn&apos;t just merch — it&apos;s a mood. From sunset tees to
            statement pieces, carry the heat, drama, and unapologetic confidence
            of the villa wherever you go.
          </p>
          <p className="mx-auto mt-6 max-w-xl font-mono text-sm font-bold uppercase tracking-[0.2em] text-white/90">
            Wear the vibe of the villa
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              Fan-made energy &nbsp;·&nbsp; Official drops &nbsp;·&nbsp; Limited runs
            </p>
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
          </div>
        </div>
      </section>

      {/* Emotional hook strip */}
      <section className="border-b border-border bg-gradient-to-r from-primary/8 via-background to-accent/8 px-4 py-4 md:px-8 lg:px-12">
        <p className="mx-auto max-w-4xl text-center text-sm font-semibold text-foreground md:text-base">
          <span className="text-primary">Live loud.</span>{" "}
          <span className="text-muted-foreground">
            Every piece is a flex — for the ones who watched every recoupling and never
            missed a moment.
          </span>
        </p>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-card px-4 py-5 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-black text-foreground">{products.length}</span>{" "}
              {products.length === 1 ? "piece" : "pieces"} in the collection
            </p>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <p className="hidden text-sm text-muted-foreground sm:block">
              Free shipping on orders above{" "}
              <span className="font-bold text-foreground">NGN 25,000</span>
            </p>
          </div>
          {products.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <p className="font-mono text-xs text-muted-foreground">
                Ready to ship
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Category filters */}
      {categories.length > 0 && (
        <section className="border-b border-border bg-card px-4 py-4 md:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
            <Link
              href="/shop"
              className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                !categorySlug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                  categorySlug === cat.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product grid or empty state */}
      <section className="relative overflow-hidden px-4 py-16 md:px-8 md:py-24 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,77,128,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-muted/30 px-6 py-20 text-center">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
                Drop incoming
              </p>
              <p className="mt-3 text-2xl font-black text-foreground">
                The rails are warming up
              </p>
              <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
                New pieces are on the way. Follow us for the next villa-worthy
                drop — you won&apos;t want to miss it.
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex rounded-full border-0 btn-gradient px-8 py-3 text-sm font-black uppercase tracking-wide text-white shadow-warm transition-all hover:brightness-110"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA — lifestyle */}
      <section className="relative overflow-hidden border-t border-border px-4 py-16 md:px-8 md:py-24 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(255,77,128,0.08),transparent)]" />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.35em] text-primary">
            Stay in the glow
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            New drops. Same energy.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground md:text-lg">
            Get first dibs on limited runs, collabs, and the pieces everyone in
            the comments will ask about.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="inline-flex items-center rounded-full border-0 btn-gradient px-8 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-warm transition-all hover:brightness-110"
            >
              Follow @loveislandng
            </a>
            <Link
              href="/islanders"
              className="inline-flex items-center rounded-full border-2 border-primary/40 bg-background px-8 py-3.5 text-sm font-black uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:bg-primary/5"
            >
              Meet the Islanders
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
