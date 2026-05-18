import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { resolveProductImageUrl } from "@/lib/resolve-product-image-url"

export const metadata: Metadata = {
  title: "Order Confirmed — Love Island Nigeria Merch",
  description: "Your Love Island Nigeria merchandise order has been confirmed. Thank you for your purchase!",
}

// ----- Types ----- //

interface OrderItem {
  productId: string
  productName: string
  productSlug: string | null
  productImage: string | null
  priceSnapshot: string
  quantity: number
}

interface OrderDetail {
  orderId: string
  orderNumber: string
  status: string
  totalAmount: string
  couponCode: string | null
  discountAmount: string | null
  currency: string
  createdAt: string
  customerFirstName: string
  customerLastName: string
  items: OrderItem[]
}

// ----- Data fetching ----- //

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

async function fetchOrder(orderNumber: string): Promise<OrderDetail | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}`,
      { cache: "no-store" },
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ----- Helpers ----- //

function formatCurrency(amount: string, currency: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso))
}

// ----- Icons ----- //

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  )
}

// ----- Layout shell ----- //

function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="bg-background">{children}</main>
}

// ----- Error state ----- //

function ErrorState({
  icon,
  iconClass,
  bgClass,
  title,
  message,
  cta,
}: {
  icon: React.ReactNode
  iconClass: string
  bgClass: string
  title: string
  message: string
  cta?: React.ReactNode
}) {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-6 py-16 text-center lg:py-24">
        <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${bgClass}`}>
          <span className={iconClass}>{icon}</span>
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{message}</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          {cta ?? (
            <Button asChild className="rounded-full px-8">
              <Link href="/shop">Back to Shop</Link>
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  )
}

// ----- Page ----- //

type Props = {
  searchParams: Promise<{ order?: string }>
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams

  // No order number in URL
  if (!orderNumber) {
    return (
      <ErrorState
        icon={<XCircleIcon className="h-12 w-12" />}
        iconClass="text-red-500"
        bgClass="bg-red-50"
        title="No Order Found"
        message="We could not identify an order from this link. Please check your confirmation email for the correct link."
        cta={
          <Button asChild className="rounded-full px-8">
            <Link href="/shop">Back to Shop</Link>
          </Button>
        }
      />
    )
  }

  // Fetch order from the backend — status is authoritative, not the URL
  const order = await fetchOrder(orderNumber)

  if (!order) {
    return (
      <ErrorState
        icon={<XCircleIcon className="h-12 w-12" />}
        iconClass="text-red-500"
        bgClass="bg-red-50"
        title="Order Not Found"
        message={`We could not find order ${orderNumber}. If you believe this is an error, please contact support.`}
        cta={
          <Button asChild className="rounded-full px-8">
            <Link href="/shop">Back to Shop</Link>
          </Button>
        }
      />
    )
  }

  // Payment still processing or failed
  if (order.status === "pending") {
    return (
      <ErrorState
        icon={<ClockIcon className="h-12 w-12" />}
        iconClass="text-amber-500"
        bgClass="bg-amber-50"
        title="Payment Pending"
        message="Your payment has not been confirmed yet. This can take a few minutes. Please check back shortly or contact support if this persists."
        cta={
          <>
            <Button asChild className="rounded-full px-8">
              <Link href={`/shop/checkout/callback?reference=${orderNumber}`}>
                Check Payment Status
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-8 bg-transparent">
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </>
        }
      />
    )
  }

  if (order.status === "failed" || order.status === "cancelled") {
    return (
      <ErrorState
        icon={<XCircleIcon className="h-12 w-12" />}
        iconClass="text-red-500"
        bgClass="bg-red-50"
        title="Payment Failed"
        message="Your payment could not be completed. Your cart items have been restored — please try again."
        cta={
          <>
            <Button asChild className="rounded-full px-8">
              <Link href="/shop/cart">Return to Cart</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-8 bg-transparent">
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </>
        }
      />
    )
  }

  // Any other non-paid status (e.g. shipped/processing/delivered is fine)
  if (!["paid", "processing", "shipped", "delivered"].includes(order.status)) {
    return (
      <ErrorState
        icon={<XCircleIcon className="h-12 w-12" />}
        iconClass="text-red-500"
        bgClass="bg-red-50"
        title="Payment Not Confirmed"
        message={`Order ${order.orderNumber} has status "${order.status}". Please contact support if you believe this is an error.`}
      />
    )
  }

  // ── Confirmed paid order ──────────────────────────────────────────────────

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
        <div className="text-center">
          {/* Success icon */}
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Order Confirmed!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thank you{order.customerFirstName ? `, ${order.customerFirstName}` : ""}! Your Love Island Nigeria merch is on its way.
          </p>

          {/* Order number + date */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5">
              <span className="text-sm text-muted-foreground">Order</span>
              <span className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5">
              <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="mt-10 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold text-foreground">Items Ordered</h2>
          </div>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 px-6 py-4">
                {/* Product thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={resolveProductImageUrl(item.productImage)}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Name + qty */}
                <div className="min-w-0 flex-1">
                  {item.productSlug ? (
                    <Link
                      href={`/shop/${item.productSlug}`}
                      className="truncate font-medium text-foreground hover:underline"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="truncate font-medium text-foreground">{item.productName}</p>
                  )}
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatCurrency(item.priceSnapshot, order.currency)} × {item.quantity}
                  </p>
                </div>

                {/* Line total */}
                <p className="shrink-0 font-semibold text-foreground">
                  {formatCurrency(
                    (parseFloat(item.priceSnapshot) * item.quantity).toFixed(2),
                    order.currency,
                  )}
                </p>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="divide-y divide-border border-t border-border">
            {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
              <div className="flex items-center justify-between px-6 py-3">
                <span className="flex items-center gap-2 text-sm text-emerald-700">
                  Discount
                  {order.couponCode && (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-xs font-semibold border border-emerald-200">
                      {order.couponCode}
                    </span>
                  )}
                </span>
                <span className="font-mono text-sm font-semibold text-emerald-700">
                  −{formatCurrency(order.discountAmount, order.currency)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between bg-muted/30 px-6 py-4">
              <span className="font-semibold text-foreground">Order Total</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <EnvelopeIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-bold text-foreground">Confirmation Email</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              A confirmation email will be sent to you shortly with your order details.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <HeartIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-bold text-foreground">Share the Love</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Show off your Love Island Nigeria merch on social media and tag us!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild className="rounded-full px-8">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full px-8 bg-transparent">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
