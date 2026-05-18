"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

interface Islander {
  id: string
  slug: string
  firstName: string
  lastName: string | null
  age: number
  location: string
  occupation: string | null
  tagline: string | null
  isPublic: boolean
  displayOrder: number
  status: string
  profileImage: string | null
  createdAt: string
}

// ── Edit dialog ─────────────────────────────────────────────────────────────

function IslanderEditDialog({
  open, islander, onClose, onSaved,
}: { open: boolean; islander: Islander; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", slug: "", age: "", location: "", occupation: "",
    tagline: "", bio: "", lookingFor: "", profileImage: "", coverImage: "",
    isPublic: false, displayOrder: "0", status: "active",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        firstName: islander.firstName, lastName: islander.lastName ?? "",
        slug: islander.slug, age: String(islander.age), location: islander.location,
        occupation: islander.occupation ?? "", tagline: islander.tagline ?? "",
        bio: "", lookingFor: "", profileImage: islander.profileImage ?? "", coverImage: "",
        isPublic: islander.isPublic, displayOrder: String(islander.displayOrder),
        status: islander.status,
      })
      setError(null)
    }
  }, [islander, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const body: Record<string, unknown> = {
        firstName: form.firstName, age: parseInt(form.age), location: form.location,
        isPublic: form.isPublic, displayOrder: parseInt(form.displayOrder) || 0, status: form.status,
      }
      if (form.slug) body.slug = form.slug
      if (form.lastName) body.lastName = form.lastName
      if (form.occupation) body.occupation = form.occupation
      if (form.tagline) body.tagline = form.tagline
      if (form.bio) body.bio = form.bio
      if (form.lookingFor) body.lookingFor = form.lookingFor
      if (form.profileImage) body.profileImage = form.profileImage
      if (form.coverImage) body.coverImage = form.coverImage
      const res = await fetch(`/api/admin/islanders/${islander.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Save failed.")
      onSaved(); onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.")
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl overflow-y-auto max-h-[90vh] rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Edit Islander</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">First Name *</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Last Name</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Age *</label>
              <input type="number" min="18" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Location *</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Occupation</label>
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tagline</label>
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} maxLength={200} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Bio</label>
            <textarea rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Leave blank to keep existing bio" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Profile Image URL</label>
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="https://... or /uploads/islanders/..." value={form.profileImage}
              onChange={e => setForm(f => ({ ...f, profileImage: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Display Order</label>
              <input type="number" min="0" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="eliminated">Eliminated</option>
                <option value="winner">Winner</option>
              </select>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} className="h-4 w-4" />
            <span className="text-foreground">Visible to public</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminIslandersPage() {
  const [islanders, setIslanders] = useState<Islander[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Islander | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/islanders", { cache: "no-store" })
      if (res.ok) setIslanders(await res.json())
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleTogglePublic(islander: Islander) {
    await fetch(`/api/admin/islanders/${islander.id}/toggle-public`, { method: "PATCH" })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this islander profile? This cannot be undone.")) return
    await fetch(`/api/admin/islanders/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <AdminPageWrapper
      title="Islander Profiles"
      description={`${islanders.length} profile${islanders.length !== 1 ? "s" : ""}`}
      breadcrumb={[
        { label: "Admin", href: "/admin"      },
        { label: "CMS",   href: "/admin/cms/islanders" },
        { label: "Islanders"                  },
      ]}
      noPadding
    >

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : islanders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm text-muted-foreground">No islanders yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Age / Location</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Visibility</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {islanders.map(islander => (
                  <tr key={islander.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {islander.firstName} {islander.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{islander.age} · {islander.location}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        islander.status === "active" ? "bg-emerald-500/10 text-emerald-700"
                          : islander.status === "winner" ? "bg-amber-500/10 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {islander.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${islander.isPublic ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {islander.isPublic ? "Public" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleTogglePublic(islander)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted">
                          {islander.isPublic ? "Hide" : "Publish"}
                        </button>
                        <button onClick={() => setEditTarget(islander)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(islander.id)}
                          className="rounded-md px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {editTarget && (
        <IslanderEditDialog
          open={true}
          islander={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load() }}
        />
      )}
    </AdminPageWrapper>
  )
}
