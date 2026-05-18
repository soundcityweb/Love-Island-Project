"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

interface Video {
  id: string
  slug: string
  title: string
  description: string | null
  embedUrl: string
  thumbnail: string | null
  duration: string | null
  tag: string | null
  isPublished: boolean
  displayOrder: number
  createdAt: string
}

const EMPTY_FORM = {
  title: "", slug: "", description: "", embedUrl: "",
  thumbnail: "", duration: "", tag: "", isPublished: false, displayOrder: "0",
}

function VideoFormDialog({
  open, editing, onClose, onSaved,
}: { open: boolean; editing: Video | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title, slug: editing.slug, description: editing.description ?? "",
        embedUrl: editing.embedUrl, thumbnail: editing.thumbnail ?? "",
        duration: editing.duration ?? "", tag: editing.tag ?? "",
        isPublished: editing.isPublished, displayOrder: String(editing.displayOrder),
      })
    } else setForm(EMPTY_FORM)
    setError(null)
  }, [editing, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const url = editing ? `/api/admin/videos/${editing.id}` : "/api/admin/videos"
      const body: Record<string, unknown> = {
        title: form.title, embedUrl: form.embedUrl,
        isPublished: form.isPublished, displayOrder: parseInt(form.displayOrder) || 0,
      }
      if (form.slug) body.slug = form.slug
      if (form.description) body.description = form.description
      if (form.thumbnail) body.thumbnail = form.thumbnail
      if (form.duration) body.duration = form.duration
      if (form.tag) body.tag = form.tag
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Save failed.")
      onSaved(); onClose()
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred.")
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">{editing ? "Edit Video" : "New Video"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Embed URL * (YouTube, Vimeo, etc.)</label>
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="https://www.youtube.com/embed/..." value={form.embedUrl}
              onChange={e => setForm(f => ({ ...f, embedUrl: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Tag</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="First Look, Trailer…" value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Duration</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="3:42" value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Thumbnail URL</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="https://..." value={form.thumbnail}
                onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Display Order</label>
              <input type="number" min="0" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="h-4 w-4" />
            <span className="text-foreground">Published</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/videos", { cache: "no-store" })
      if (res.ok) setVideos(await res.json())
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleToggle(id: string) {
    await fetch(`/api/admin/videos/${id}/toggle-published`, { method: "PATCH" })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this video?")) return
    await fetch(`/api/admin/videos/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <AdminPageWrapper
      title="Videos"
      description={`${videos.length} video${videos.length !== 1 ? "s" : ""}`}
      breadcrumb={[
        { label: "Admin", href: "/admin"              },
        { label: "CMS",   href: "/admin/cms/videos"  },
        { label: "Videos"                             },
      ]}
      actions={
        <button
          onClick={() => { setEditing(null); setDialogOpen(true) }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Video
        </button>
      }
      noPadding
    >
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl border border-border bg-card" />)}</div>
        ) : videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm text-muted-foreground">No videos yet</p>
            <button onClick={() => { setEditing(null); setDialogOpen(true) }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Add first video
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tag</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {videos.map(v => (
                  <tr key={v.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{v.displayOrder}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{v.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.tag ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.duration ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.isPublished ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {v.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(v.id)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted">
                          {v.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => { setEditing(v); setDialogOpen(true) }}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted">Edit</button>
                        <button onClick={() => handleDelete(v.id)}
                          className="rounded-md px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <VideoFormDialog open={dialogOpen} editing={editing} onClose={() => setDialogOpen(false)} onSaved={load} />
    </AdminPageWrapper>
  )
}
