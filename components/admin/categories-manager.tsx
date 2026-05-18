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
import type { CategoryItem } from "@/app/admin/(shell)/categories/page"

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

// ----- Types ----- //

interface FormState {
  name: string
  slug: string
  description: string
  sortOrder: string
  isActive: boolean
}

const emptyForm = (): FormState => ({
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isActive: true,
})

function autoSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
}

// ----- Component ----- //

export function CategoriesManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
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

  function openEdit(cat: CategoryItem) {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    })
    setError(null)
    setDialogOpen(true)
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      // auto-fill slug only when creating (not editing)
      ...(editingId === null ? { slug: autoSlug(name) } : {}),
    }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Name is required."); return }
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || autoSlug(form.name),
      description: form.description.trim() || undefined,
      sortOrder: parseInt(form.sortOrder) || 0,
      isActive: form.isActive,
    }

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories"
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
      // Optimistic update
      if (editingId) {
        setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, ...data } : c))
      } else {
        setCategories((prev) => [...prev, data])
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
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
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
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{categories.length}</span> categories
        </p>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <PlusIcon className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No categories yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 hidden md:table-cell text-center">Order</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-card-foreground">{cat.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-center text-muted-foreground">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant="outline"
                      className={cat.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-500"}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(cat)}>
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                      {deleteId === cat.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Sure?</span>
                          <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => handleDelete(cat.id)} disabled={loading}>
                            Yes
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setDeleteId(null)}>
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(cat.id)}>
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
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. T-Shirts"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g. t-shirts"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Used in URLs. Auto-generated from name if blank.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Input
                id="cat-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-order">Sort Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <label htmlFor="cat-active" className="text-sm">Active</label>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : editingId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
