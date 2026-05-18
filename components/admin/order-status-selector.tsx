"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ----- Types ----- //

type ApiOrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "failed" | "cancelled"

// ----- Status config ----- //

const STATUS_OPTIONS: { value: ApiOrderStatus; label: string; badgeClass: string; dotClass: string }[] = [
  { value: "pending",    label: "Pending",    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",       dotClass: "bg-amber-500"   },
  { value: "paid",       label: "Paid",       badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700", dotClass: "bg-emerald-500" },
  { value: "processing", label: "Processing", badgeClass: "border-blue-200 bg-blue-50 text-blue-700",          dotClass: "bg-blue-500"    },
  { value: "shipped",    label: "Shipped",    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",    dotClass: "bg-violet-500"  },
  { value: "delivered",  label: "Delivered",  badgeClass: "border-teal-200 bg-teal-50 text-teal-700",          dotClass: "bg-teal-500"    },
  { value: "failed",     label: "Failed",     badgeClass: "border-red-200 bg-red-50 text-red-600",             dotClass: "bg-red-500"     },
  { value: "cancelled",  label: "Cancelled",  badgeClass: "border-zinc-200 bg-zinc-50 text-zinc-500",          dotClass: "bg-zinc-400"    },
]

function statusConfig(status: ApiOrderStatus) {
  return STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
}

// ----- Icons ----- //

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

// ----- Component ----- //

interface Props {
  orderNumber: string
  currentStatus: ApiOrderStatus
}

export function OrderStatusSelector({ orderNumber, currentStatus }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<ApiOrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isDirty = selected !== currentStatus
  const cfg = statusConfig(selected)

  async function handleUpdate() {
    if (!isDirty) return
    setLoading(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderNumber)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selected }),
        },
      )

      if (res.ok) {
        setSuccessMsg(`Status updated to "${statusConfig(selected).label}".`)
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.message ?? `Request failed (${res.status}).`)
      }
    } catch {
      setErrorMsg("Could not reach the server. Check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Update Status
      </h2>

      {/* Current status */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Current</span>
        <Badge variant="outline" className={statusConfig(currentStatus).badgeClass}>
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusConfig(currentStatus).dotClass}`} />
          {statusConfig(currentStatus).label}
        </Badge>
      </div>

      {/* Select new status */}
      <div className="relative mb-4">
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value as ApiOrderStatus)
            setSuccessMsg(null)
            setErrorMsg(null)
          }}
          disabled={loading}
          className={`
            w-full appearance-none rounded-lg border py-2.5 pl-4 pr-9 text-sm font-medium
            ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring
            disabled:cursor-not-allowed disabled:opacity-50
            ${cfg.badgeClass}
          `}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
      </div>

      {/* Submit */}
      <Button
        onClick={handleUpdate}
        disabled={!isDirty || loading}
        className="w-full gap-2"
        size="sm"
      >
        {loading && <SpinnerIcon className="h-3.5 w-3.5" />}
        {loading ? "Updating…" : "Apply"}
      </Button>

      {/* Feedback */}
      {successMsg && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {successMsg}
        </p>
      )}
      {errorMsg && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
