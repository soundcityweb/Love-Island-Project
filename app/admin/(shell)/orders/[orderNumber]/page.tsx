import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderStatusSelector } from "@/components/admin/order-status-selector"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { resolveProductImageUrl } from "@/lib/resolve-product-image-url"

export const metadata: Metadata = {
  title: "Order Detail — Love Island Nigeria Admin",
}

// ----- Types ----- //

type ApiOrderStatus = "pending" | "paid" | "failed" | "processing" | "shipped" | "delivered" | "cancelled"

interface OrderItem {
  productId: string
  productName: string
  productSlug: string | null
  productImage: string | null
  priceSnapshot: string
  quantity: number
}

interface AdminOrderDetail {
  orderId: string
  orderNumber: string
  status: ApiOrderStatus
  totalAmount: string
  subtotalAmount: string
  couponCode: string | null
  discountAmount: string | null
  currency: string
  createdAt: string
  shippedAt: string | null
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: string
  shippingCity: string
  shippingState: string
  items: OrderItem[]
}

// ----- Data fetching ----- //

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchOrder(orderNumber: string): Promise<AdminOrderDetail | null> {
  if (!ADMIN_KEY) return null
  try {
    const res = await fetch(
      `${API_BASE}/api/admin/orders/${encodeURIComponent(orderNumber)}`,
      {
        headers: { "X-Admin-Key": ADMIN_KEY },
        cache: "no-store",
      },
    )
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ----- Helpers ----- //

function formatCurrency(amount: string, currency: string) {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso))
}

// ----- Status config ----- //

const STATUS_CONFIG: Record<
  ApiOrderStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending:    { label: "Pending",    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",     dotClass: "bg-amber-500" },
  paid:       { label: "Paid",       badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700", dotClass: "bg-emerald-500" },
  failed:     { label: "Failed",     badgeClass: "border-red-200 bg-red-50 text-red-600",           dotClass: "bg-red-500" },
  processing: { label: "Processing", badgeClass: "border-blue-200 bg-blue-50 text-blue-700",        dotClass: "bg-blue-500" },
  shipped:    { label: "Shipped",    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",  dotClass: "bg-violet-500" },
  delivered:  { label: "Delivered",  badgeClass: "border-teal-200 bg-teal-50 text-teal-700",        dotClass: "bg-teal-500" },
  cancelled:  { label: "Cancelled",  badgeClass: "border-zinc-200 bg-zinc-50 text-zinc-500",        dotClass: "bg-zinc-400" },
}

function StatusBadge({ status }: { status: ApiOrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <Badge variant="outline" className={`text-sm px-3 py-1 ${cfg.badgeClass}`}>
      <span className={`mr-2 inline-block h-2 w-2 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  )
}

// ----- Icons ----- //

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

// ----- Page ----- //

type Props = {
  params: Promise<{ orderNumber: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params
  const order = await fetchOrder(orderNumber)

  if (!order) notFound()

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending

  return (
    <AdminPageWrapper
      title={order.orderNumber}
      description={`Placed on ${formatDateTime(order.createdAt)}${order.shippedAt ? ` · Shipped on ${formatDateTime(order.shippedAt)}` : ""}`}
      breadcrumb={[
        { label: "Admin",  href: "/admin"        },
        { label: "Orders", href: "/admin/orders" },
        { label: order.orderNumber               },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
        </div>
      }
    >
      <div className="p-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: status selector + customer + shipping */}
          <div className="space-y-6 lg:col-span-1">
            {/* Status selector */}
            <OrderStatusSelector
              orderNumber={order.orderNumber}
              currentStatus={order.status}
            />

            {/* Customer */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</h2>
              </div>
              <p className="font-semibold text-card-foreground">
                {order.customerFirstName} {order.customerLastName}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
                  <a href={`mailto:${order.customerEmail}`} className="hover:text-foreground hover:underline truncate">
                    {order.customerEmail}
                  </a>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${order.customerPhone}`} className="hover:text-foreground hover:underline">
                      {order.customerPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shipping Address</h2>
              </div>
              <p className="text-sm text-card-foreground">{order.shippingAddress}</p>
              <p className="mt-1 text-sm text-card-foreground">
                {order.shippingCity}, {order.shippingState}
              </p>
            </div>

            {/* Order meta */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Info</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Order ID</dt>
                  <dd className="font-mono text-xs text-card-foreground truncate max-w-[140px]" title={order.orderId}>
                    {order.orderId.slice(0, 8)}…
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.badgeClass.includes("text-") ? cfg.badgeClass.split(" ").find(c => c.startsWith("text-")) : ""}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                      {cfg.label}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Currency</dt>
                  <dd className="font-medium text-card-foreground">{order.currency}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right column: items + totals */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-card-foreground">
                  Items ({order.items.length})
                </h2>
              </div>

              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-4 px-5 py-4">
                    {/* Product thumbnail */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={resolveProductImageUrl(item.productImage)}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>

                    {/* Name + price per unit */}
                    <div className="min-w-0 flex-1">
                      {item.productSlug ? (
                        <Link
                          href={`/shop/${item.productSlug}`}
                          target="_blank"
                          className="truncate font-medium text-card-foreground hover:underline"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="truncate font-medium text-card-foreground">{item.productName}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(item.priceSnapshot, order.currency)} × {item.quantity}
                      </p>
                    </div>

                    {/* Line total */}
                    <p className="shrink-0 font-mono text-sm font-semibold text-card-foreground">
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
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-sm text-card-foreground">
                    {formatCurrency(order.subtotalAmount, order.currency)}
                  </span>
                </div>
                {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                  <div className="flex items-center justify-between px-5 py-3">
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
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="font-semibold text-primary-foreground/80">Order Total</span>
                  <span className="font-mono text-lg font-bold text-primary-foreground">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
