"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/shop/cart-context"

// ----- Icons ----- //

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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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

// ----- Helpers ----- //

function formatPrice(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ----- Page ----- //

export default function CartPage() {
  const { items, totalItems, updateQuantity, removeItem } = useCart()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Use the primary currency from first item (all products are NGN in practice)
  const currency = items[0]?.currency ?? "NGN"

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 md:px-8 py-10 lg:px-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/shop"
            className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Shop
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium text-foreground">Your Cart</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          Your Cart
        </h1>
        <p className="mt-2 text-muted-foreground">
          {items.length === 0
            ? "Your cart is empty."
            : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`}
        </p>

        {items.length === 0 ? (
          /* Empty state */
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <CartIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-foreground">
              Nothing here yet
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Looks like you haven&apos;t added anything to your cart. Browse
              the store and find something you love.
            </p>
            <Button asChild className="mt-8 rounded-full px-8">
              <Link href="/shop">Browse the Store</Link>
            </Button>
          </div>
        ) : (<>
          {/* Sticky mobile checkout bar */}
          <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm lg:hidden">
            <div>
              <p className="text-xs text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              <p className="text-lg font-black tabular-nums text-foreground">{formatPrice(subtotal, currency)}</p>
            </div>
            <Link
              href="/shop/checkout"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full btn-gradient px-6 text-sm font-black text-white shadow-warm transition-all hover:brightness-110"
            >
              <LockIcon className="h-4 w-4" />
              Checkout
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left -- Cart items */}
            <div className="pb-24 lg:col-span-7 lg:pb-0">
              {/* Items list */}
              <ul className="divide-y divide-border" aria-label="Cart items">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-5 py-6 first:pt-0 last:pb-0"
                  >
                    {/* Image */}
                    <Link
                      href={`/shop/${item.slug}`}
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary sm:h-32 sm:w-32"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={256}
                        height={256}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {item.category}
                        </p>
                        <Link
                          href={`/shop/${item.slug}`}
                          className="mt-1 block text-sm font-bold text-foreground transition-colors hover:text-primary sm:text-base"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="inline-flex items-center rounded-lg border border-border bg-card">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-11 w-10 items-center justify-center border-x border-border font-mono text-xs font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-red-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>

                        {/* Line total (right-aligned) */}
                        <span className="ml-auto font-mono text-sm font-bold text-foreground">
                          {formatPrice(item.price * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right -- Order summary */}
            <aside className="lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 lg:p-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-card-foreground">
                  Order Summary
                </h2>

                <Separator className="my-5" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-card-foreground">
                    Total ({totalItems} item{totalItems !== 1 ? "s" : ""})
                  </span>
                  <span className="text-xl font-bold text-card-foreground">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="mt-6 w-full gap-2 rounded-full text-base"
                >
                  <Link href="/shop/checkout">
                    <LockIcon className="h-5 w-5" />
                    Proceed to Checkout
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="mt-3 w-full rounded-full bg-transparent"
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>

                {/* Trust signals */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-lg border border-dashed border-border px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <LockIcon className="h-3.5 w-3.5" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldIcon className="h-3.5 w-3.5" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>)}
    </main>
  )
}
