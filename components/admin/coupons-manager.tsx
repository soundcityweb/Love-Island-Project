"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { CouponItem } from "@/app/admin/(shell)/coupons/page"

// ----- Icons ----- //

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
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

// ----- Helpers ----- //

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
}

// ----- Types ----- //

interface FormState {
  code: string
  discountType: "percentage" | "flat"
  discountValue: string
  minOrderAmount: string
  maxUses: string
  expiresAt: string
  isActive: boolean
}

const emptyForm = (): FormState => ({
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
})

// ----- Component ----- //

export function CouponsManager({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const router = useRouter()
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(c: CouponItem) {
    setEditingId(c.id)
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount ?? "",
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      isActive: c.isActive,
    })
    setError(null)
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.code.trim()) { setError("Code is required."); return }
    if (!form.discountValue || isNaN(parseFloat(form.discountValue)) || parseFloat(form.discountValue) <= 0) {
      setError("Discount value must be a positive number."); return
    }
    if (form.discountType === "percentage" && parseFloat(form.discountValue) > 100) {
      setError("Percentage discount cannot exceed 100."); return
    }

    setLoading(true)
    setError(null)

    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      isActive: form.isActive,
    }
    if (form.minOrderAmount.trim()) payload.minOrderAmount = parseFloat(form.minOrderAmount)
    if (form.maxUses.trim()) payload.maxUses = parseInt(form.maxUses)
    if (form.expiresAt.trim()) payload.expiresAt = new Date(form.expiresAt).toISOString()

    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.message ?? "Request failed."); return }

      setDialogOpen(false)
      router.refresh()
      if (editingId) {
        setCoupons((prev) => prev.map((c) => c.id === editingId ? { ...c, ...data } : c))
      } else {
        setCoupons((prev) => [data, ...prev])
      }
    } catch {
      setError("Could not reach the server.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id))
        setDeleteId(null)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.message ?? "Delete failed.")
      }
    } catch {
      alert("Could not reach the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{coupons.length}</span> coupon{coupons.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <PlusIcon className="h-4 w-4" />
          New Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No coupons yet. Create one to start a campaign.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3 hidden md:table-cell text-center">Uses</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Expires</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-bold text-card-foreground">{coupon.code}</td>
                    <td className="px-4 py-3">
                      {coupon.discountType === "percentage"
                        ? `${parseFloat(coupon.discountValue).toFixed(0)}% off`
                        : `NGN ${parseFloat(coupon.discountValue).toLocaleString("en-NG")} off`}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-center text-muted-foreground">
                      {coupon.usedCount}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{formatDate(coupon.expiresAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={coupon.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-zinc-200 bg-zinc-50 text-zinc-500"}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(coupon)}>
                          <PencilIcon className="h-3.5 w-3.5" />
                        </Button>
                        {deleteId === coupon.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Sure?</span>
                            <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => handleDelete(coupon.id)} disabled={loading}>Yes</Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setDeleteId(null)}>No</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(coupon.id)}>
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Coupon" : "New Coupon"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">Code *</Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                className="font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-type">Type *</Label>
                <select
                  id="coupon-type"
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "percentage" | "flat" }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (NGN)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coupon-value">
                  Value * {form.discountType === "percentage" ? "(%)" : "(NGN)"}
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0.01"
                  max={form.discountType === "percentage" ? "100" : undefined}
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === "percentage" ? "20" : "5000"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-min">Min Order (NGN)</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coupon-max">Max Uses</Label>
                <Input
                  id="coupon-max"
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coupon-expires">Expiry Date</Label>
              <Input
                id="coupon-expires"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="coupon-active"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="coupon-active" className="text-sm">Active</label>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : editingId ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
