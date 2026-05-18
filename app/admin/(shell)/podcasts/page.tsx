"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

// ── Types ──────────────────────────────────────────────────────────────────

interface PodcastEpisode {
  id: string
  slug: string
  title: string
  audioUrl: string
  videoUrl: string
  notes: string | null
  thumbnailUrl: string | null
  crossLinks: { label: string; url: string }[] | null
  status: string
  publishedAt: string | null
  createdAt: string
  updatedAt?: string
}

type CrossLinkRow = { id: string; title: string; url: string }

function normalizeAdminPodcast(raw: Record<string, unknown>): PodcastEpisode {
  return {
    id: String(raw.id ?? ""),
    slug: String(raw.slug ?? ""),
    title: String(raw.title ?? ""),
    audioUrl: String((raw.audioUrl ?? raw.audio_url) ?? ""),
    videoUrl: String((raw.videoUrl ?? raw.video_url) ?? ""),
    notes: ((raw.notes as string | null) ?? null) || null,
    thumbnailUrl: ((raw.thumbnailUrl ?? raw.thumbnail_url) as string | null) ?? null,
    crossLinks: (raw.crossLinks ?? raw.cross_links) as PodcastEpisode["crossLinks"],
    status: String(raw.status ?? "draft"),
    publishedAt: ((raw.publishedAt ?? raw.published_at) as string | null) ?? null,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : raw.updated_at != null ? String(raw.updated_at) : undefined,
  }
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function makeRowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function emptyCrossRow(): CrossLinkRow {
  return { id: makeRowId(), title: "", url: "" }
}

function validateHttpUrl(s: string, fieldLabel: string): string | null {
  const t = s.trim()
  if (!t) return null
  try {
    const u = new URL(t)
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return `${fieldLabel} must use http or https.`
    }
    return null
  } catch {
    return `${fieldLabel} must be a valid URL.`
  }
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ── Form dialog (mirrors News & Articles `ArticleFormDialog`) ────────────────

interface FormState {
  title: string
  slug: string
  audioUrl: string
  videoUrl: string
  notes: string
  thumbnailUrl: string
  publishedDate: string
  isPublished: boolean
  crossLinks: CrossLinkRow[]
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  audioUrl: "",
  videoUrl: "",
  notes: "",
  thumbnailUrl: "",
  publishedDate: "",
  isPublished: false,
  crossLinks: [],
}

function PodcastFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: PodcastEpisode | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      const links = (editing.crossLinks ?? []).map((l) => ({
        id: makeRowId(),
        title: l.label,
        url: l.url,
      }))
      setForm({
        title: editing.title,
        slug: editing.slug,
        audioUrl: editing.audioUrl ?? "",
        videoUrl: editing.videoUrl ?? "",
        notes: editing.notes ?? "",
        thumbnailUrl: editing.thumbnailUrl ?? "",
        publishedDate: toDateInputValue(editing.publishedAt),
        isPublished: editing.status === "published",
        crossLinks: links.length ? links : [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(null)
    setUploadError(null)
  }, [editing, open])

  const addCrossLink = useCallback(() => {
    setForm((f) => ({ ...f, crossLinks: [...f.crossLinks, emptyCrossRow()] }))
  }, [])

  const removeCrossLink = useCallback((id: string) => {
    setForm((f) => ({ ...f, crossLinks: f.crossLinks.filter((r) => r.id !== id) }))
  }, [])

  const updateCrossLink = useCallback((id: string, patch: Partial<CrossLinkRow>) => {
    setForm((f) => ({
      ...f,
      crossLinks: f.crossLinks.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  }, [])

  if (!open) return null

  async function handleCoverFileSelect(fileList: FileList | null) {
    if (!fileList?.length) return
    const file = Array.from(fileList).find((f) => f.type.startsWith("image/"))
    if (!file) return
    setUploadingCover(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/admin/articles/cover", { method: "POST", body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError((data as { message?: string }).message || "Upload failed.")
        return
      }
      const url = (data as { url?: string }).url
      if (url) setForm((f) => ({ ...f, thumbnailUrl: url }))
    } catch {
      setUploadError("Network error during upload.")
    } finally {
      setUploadingCover(false)
    }
  }

  function validateForm(): string | null {
    if (!form.title.trim()) return "Title is required."
    if (form.title.length > 500) return "Title must be at most 500 characters."
    const audioT = form.audioUrl.trim()
    const videoT = form.videoUrl.trim()
    if (!audioT && !videoT) {
      return "Provide either Audio URL or Video URL (at least one required)."
    }
    if (audioT.length > 2048) return "Audio URL must be at most 2048 characters."
    if (videoT.length > 2048) return "Video URL must be at most 2048 characters."
    if (audioT) {
      const audioErr = validateHttpUrl(form.audioUrl, "Audio URL")
      if (audioErr) return audioErr
    }
    if (videoT) {
      const videoErr = validateHttpUrl(form.videoUrl, "Video URL")
      if (videoErr) return videoErr
    }
    const s = form.slug.trim()
    if (s) {
      if (s.length > 256) return "Slug must be at most 256 characters."
      if (!SLUG_REGEX.test(s)) {
        return "Slug: lowercase letters, numbers, and hyphens only (e.g. week-4-recap)."
      }
    }
    if (form.thumbnailUrl.trim()) {
      if (form.thumbnailUrl.length > 2048) return "Cover image URL must be at most 2048 characters."
      const t = validateHttpUrl(form.thumbnailUrl, "Cover image URL")
      if (t) return t
    }
    for (const row of form.crossLinks) {
      const t = row.title.trim()
      const u = row.url.trim()
      if (t && !u) return "Each cross link with a title needs a URL."
      if (u && !t) return "Each cross link with a URL needs a title."
      if (u) {
        const m = validateHttpUrl(row.url, "Cross link URL")
        if (m) return m
      }
    }
    if (form.crossLinks.length > 50) return "Maximum 50 cross links."
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validateForm()
    if (v) {
      setError(v)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const status = form.isPublished ? "published" : "draft"
      const links = form.crossLinks
        .filter((r) => r.title.trim() && r.url.trim())
        .map((r) => ({ label: r.title.trim(), url: r.url.trim() }))

      if (editing) {
        const body: Record<string, unknown> = {
          title: form.title.trim(),
          audioUrl: form.audioUrl.trim(),
          videoUrl: form.videoUrl.trim(),
          notes: form.notes.trim() ? form.notes.trim() : "",
          thumbnailUrl: form.thumbnailUrl.trim() ? form.thumbnailUrl.trim() : "",
          status,
          crossLinks: links,
        }
        if (form.slug.trim()) body.slug = form.slug.trim()
        if ((form.publishedDate ?? "").trim()) {
          body.publishedAt = new Date(`${form.publishedDate}T12:00:00`).toISOString()
        }
        const res = await fetch(`/api/admin/podcasts/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((data as { message?: string }).message ?? "Save failed.")
      } else {
        const body: Record<string, unknown> = {
          title: form.title.trim(),
          audioUrl: form.audioUrl.trim(),
          videoUrl: form.videoUrl.trim(),
          status,
        }
        if (form.notes.trim()) body.notes = form.notes.trim()
        if (form.thumbnailUrl.trim()) body.thumbnailUrl = form.thumbnailUrl.trim()
        if (form.slug.trim()) body.slug = form.slug.trim()
        if ((form.publishedDate ?? "").trim()) {
          body.publishedAt = new Date(`${form.publishedDate}T12:00:00`).toISOString()
        }
        if (links.length) body.crossLinks = links
        const res = await fetch("/api/podcasts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((data as { message?: string }).message ?? "Save failed.")
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
      <div className="my-auto flex w-full max-w-xl max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {editing ? "Edit Podcast Episode" : "New Podcast Episode"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                maxLength={500}
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Provide either Audio URL or Video URL (at least one required).
              </p>
              <label className="mb-1 block text-sm font-medium text-foreground">Audio URL</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.audioUrl}
                onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
                maxLength={2048}
                placeholder="https://…"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Video URL</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                maxLength={2048}
                placeholder="https://… (optional)"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                rows={10}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Episode description, timestamps, links mentioned on mic…"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Cover image</label>
              <p className="mb-2 text-xs text-muted-foreground">
                Optional: paste a URL or upload an image (upload fills the URL field).
              </p>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingCover}
                className="mb-2 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-muted file:px-3 file:py-1.5"
                onChange={(e) => {
                  void handleCoverFileSelect(e.target.files)
                  e.target.value = ""
                }}
              />
              {uploadingCover && <p className="mb-2 text-xs text-muted-foreground">Uploading cover…</p>}
              {uploadError && <p className="mb-2 text-xs text-destructive">{uploadError}</p>}
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Image URL</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.thumbnailUrl}
                onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">Published date</label>
                <p className="mb-1 text-xs text-muted-foreground">
                  Optional; if empty and Published is on, the server sets the publication time to now when creating.
                </p>
                <input
                  type="date"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  value={form.publishedDate}
                  onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Slug (auto-generated if blank)</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                placeholder="my-episode-slug"
                maxLength={256}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Cross links</label>
              <p className="mb-2 text-xs text-muted-foreground">Optional. Title and URL for each promo or partner link.</p>
              <button
                type="button"
                onClick={addCrossLink}
                disabled={form.crossLinks.length >= 50}
                className="mb-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                + Add link
              </button>
              <ul className="space-y-3">
                {form.crossLinks.map((row) => (
                  <li key={row.id} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                        <input
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                          value={row.title}
                          onChange={(e) => updateCrossLink(row.id, { title: e.target.value })}
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">URL</label>
                        <input
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                          value={row.url}
                          onChange={(e) => updateCrossLink(row.id, { url: e.target.value })}
                          maxLength={2048}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCrossLink(row.id)}
                      className="mt-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-foreground">Published</span>
            </label>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-card px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Podcast Episode"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminPodcastsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PodcastEpisode | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/podcasts", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        const rows = Array.isArray(data) ? data : []
        setEpisodes(rows.map((row: Record<string, unknown>) => normalizeAdminPodcast(row)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null)
      setDialogOpen(true)
      router.replace("/admin/podcasts")
    }
  }, [searchParams, router])

  useEffect(() => {
    const editId = searchParams.get("edit")
    if (!editId) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/podcasts/${editId}`, { cache: "no-store" })
        const raw = await res.json().catch(() => null)
        if (cancelled || !res.ok || !raw || typeof raw !== "object") return
        setEditing(normalizeAdminPodcast(raw as Record<string, unknown>))
        setDialogOpen(true)
        router.replace("/admin/podcasts")
      } catch {
        /* ignore */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  async function handleTogglePublished(ep: PodcastEpisode) {
    await fetch(`/api/admin/podcasts/${ep.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: ep.status === "published" ? "draft" : "published" }),
    })
    void load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this episode? This cannot be undone.")) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/podcasts/${id}`, { method: "DELETE" })
      void load()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminPageWrapper
      title="Podcasts"
      description={`${episodes.length} episode${episodes.length !== 1 ? "s" : ""} total`}
      breadcrumb={[
        { label: "Admin",   href: "/admin"           },
        { label: "Podcast"                           },
      ]}
      actions={
        <button
          onClick={() => { setEditing(null); setDialogOpen(true) }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Podcast Episode
        </button>
      }
      noPadding
    >

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">No episodes yet</p>
            <button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create your first episode
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Published</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {episodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{ep.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">Podcast</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          ep.status === "published"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ep.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ep.publishedAt
                        ? new Date(ep.publishedAt).toLocaleDateString()
                        : ep.createdAt
                          ? new Date(ep.createdAt).toLocaleDateString()
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void handleTogglePublished(ep)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                        >
                          {ep.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(ep)
                            setDialogOpen(true)
                          }}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(ep.id)}
                          disabled={deletingId === ep.id}
                          className="rounded-md px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
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

      <PodcastFormDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
        onSaved={() => void load()}
      />
    </AdminPageWrapper>
  )
}
