"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/app/shop/cart-context"

export interface ProductFull {
  id: string
  slug: string
  name: string
  /** Numeric price in the product's currency. */
  price: number
  currency: string
  /** Primary image URL (first in sorted order). */
  image: string
  /** All image URLs sorted by sort_order. */
  images?: string[]
  category: string
  badge?: string
  description: string
  /** Whether the product has stock available (stock > 0). */
  inStock: boolean
}

function formatPrice(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
  )
}

export function ProductDetail({ product }: { product: ProductFull }) {
  const { addItem, isInCart, getQuantity, totalItems } = useCart()
  const allImages = product.images?.length ? product.images : [product.image]
  const [activeIndex, setActiveIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const isOutOfStock = !product.inStock
  const alreadyInCart = isInCart(product.id)
  const cartQty = getQuantity(product.id)

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        currency: product.currency,
        category: product.category,
      },
      quantity,
    )
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 3000)
  }, [isOutOfStock, addItem, product, quantity])

  function goTo(index: number) {
    setActiveIndex((index + allImages.length) % allImages.length)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link href="/shop" className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Shop
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-muted-foreground">{product.category}</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left — Image carousel */}
        <div className="relative">
          {product.badge && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              {product.badge}
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Out of Stock
            </span>
          )}

          <div className="group relative overflow-hidden rounded-2xl border border-border bg-secondary">
            <Image
              src={allImages[activeIndex]}
              alt={`${product.name} - Image ${activeIndex + 1}`}
              width={800}
              height={800}
              className={`h-full w-full object-cover transition-opacity duration-300 ${isOutOfStock ? "opacity-60" : ""}`}
              priority
            />

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-card lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-card lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}

            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 lg:hidden">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex ? "w-6 bg-primary" : "w-2 bg-card/60"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="mt-4 hidden gap-3 lg:flex">
              {allImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    i === activeIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border opacity-60 hover:border-primary/40 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                >
                  <Image
                    src={src}
                    alt=""
                    width={100}
                    height={100}
                    className="h-16 w-16 object-cover lg:h-20 lg:w-20"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="flex flex-col">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-bold text-foreground lg:text-3xl">
            {formatPrice(product.price, product.currency)}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className={`flex h-2 w-2 rounded-full ${isOutOfStock ? "bg-destructive" : "bg-emerald-500"}`} />
            <span className={`text-sm font-medium ${isOutOfStock ? "text-destructive" : "text-emerald-600"}`}>
              {isOutOfStock ? "Out of stock" : "In stock"}
            </span>
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 h-px bg-border" />

          {isOutOfStock ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-foreground">Currently unavailable</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  This item is out of stock. Check back soon or browse other products.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Quantity + Add to Cart — same row */}
              <div className="mt-6 flex items-end gap-4">
                <div>
                  <p className="mb-2 text-sm font-bold text-foreground">Quantity</p>
                  <div className="inline-flex items-center rounded-lg border border-border bg-card">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="flex h-11 w-12 items-center justify-center border-x border-border font-mono text-sm font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      disabled={quantity >= 10}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all ${
                    justAdded
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <CartIcon className="h-5 w-5" />
                      {alreadyInCart ? `Add More (${cartQty} in cart)` : "Add to Cart"}
                    </>
                  )}
                </button>
              </div>

              {/* Post-add actions */}
              {justAdded && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Added to your cart</p>
                      <p className="text-xs text-emerald-700">
                        {product.name} &middot; Qty {quantity}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/shop/cart"
                    className="shrink-0 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  >
                    View Cart
                    {totalItems > 0 && (
                      <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Already-in-cart persistent nudge (when not just-added) */}
              {!justAdded && alreadyInCart && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{cartQty}</span> of this item in your cart
                  </p>
                  <Link
                    href="/shop/cart"
                    className="shrink-0 rounded-full border border-border px-4 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    View Cart
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card/50 px-4 py-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <ShieldIcon className="h-5 w-5 text-muted-foreground" />
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">
                Secure Checkout
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RefreshIcon className="h-5 w-5 text-muted-foreground" />
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">
                14-Day Returns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
