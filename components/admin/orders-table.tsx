"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ----- Types ----- //

export type ApiOrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "failed" | "cancelled"

export interface OrderSummary {
  orderId: string
  orderNumber: string
  status: ApiOrderStatus
  totalAmount: string
  currency: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  itemCount: number
  createdAt: string
}

export interface PaginatedOrders {
  data: OrderSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ----- Helpers ----- //

function formatCurrency(amount: string, currency: string) {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ----- Status config ----- //

const STATUS_CONFIG: Record<
  ApiOrderStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  },
  paid: {
    label: "Paid",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  processing: {
    label: "Processing",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
    dotClass: "bg-violet-500",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "border-teal-200 bg-teal-50 text-teal-700",
    dotClass: "bg-teal-500",
  },
  failed: {
    label: "Failed",
    badgeClass: "border-red-200 bg-red-50 text-red-600",
    dotClass: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "border-zinc-200 bg-zinc-50 text-zinc-500",
    dotClass: "bg-zinc-400",
  },
}

function StatusBadge({ status }: { status: ApiOrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <Badge variant="outline" className={cfg.badgeClass}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  )
}

// ----- Tab config ----- //

const TABS = [
  { value: "all",        label: "All"        },
  { value: "pending",    label: "Pending"    },
  { value: "paid",       label: "Paid"       },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped"    },
  { value: "delivered",  label: "Delivered"  },
  { value: "failed",     label: "Failed"     },
  { value: "cancelled",  label: "Cancelled"  },
] as const

// ----- Icons ----- //

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
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

function EmptyBoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

// ----- Pagination ----- //

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= totalPages - 3) return totalPages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      {pages[0] > 1 && (
        <>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => onPageChange(1)}>1</Button>
          {pages[0] > 2 && <span className="px-1 text-xs text-muted-foreground">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 text-xs"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ----- Main Component ----- //

interface Props {
  initialData: PaginatedOrders
  currentStatus: string
  currentPage: number
}

export function OrdersTable({ initialData, currentStatus, currentPage }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")

  function navigate(page: number, status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status === "all") {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    router.push(`/admin/orders${params.size > 0 ? `?${params}` : ""}`)
  }

  function handleTabChange(tab: string) {
    navigate(1, tab)
  }

  function handlePageChange(page: number) {
    navigate(page, currentStatus)
  }

  // Client-side search on the current page
  const filtered = useMemo(() => {
    if (!search.trim()) return initialData.data
    const q = search.toLowerCase()
    return initialData.data.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        `${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q),
    )
  }, [initialData.data, search])

  const { total, page, totalPages } = initialData

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span>{" "}
          {total === 1 ? "order" : "orders"} total
        </p>
        {currentStatus !== "all" && (
          <Badge variant="outline" className={STATUS_CONFIG[currentStatus as ApiOrderStatus]?.badgeClass ?? ""}>
            Filtered by: {STATUS_CONFIG[currentStatus as ApiOrderStatus]?.label ?? currentStatus}
          </Badge>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={currentStatus} onValueChange={handleTabChange}>
          <TabsList className="flex-wrap">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search this page..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Items</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <EmptyBoxIcon className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm">No orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow
                  key={order.orderId}
                  className={order.status === "cancelled" || order.status === "failed" ? "opacity-60" : ""}
                >
                  {/* Order number */}
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-card-foreground">
                      {order.orderNumber}
                    </span>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {order.customerFirstName} {order.customerLastName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <p className="text-sm text-card-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>

                  {/* Total */}
                  <TableCell className="text-right">
                    <span className="font-mono text-sm font-bold text-card-foreground">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </span>
                  </TableCell>

                  {/* Items count */}
                  <TableCell className="hidden text-right lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      asChild
                    >
                      <Link href={`/admin/orders/${order.orderNumber}`}>
                        View
                        <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer: count + pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} &middot; {total} total {total === 1 ? "order" : "orders"}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}
