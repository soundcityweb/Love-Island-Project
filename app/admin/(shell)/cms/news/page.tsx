"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

// ── Types ──────────────────────────────────────────────────────────────────

type ArticleCategory = "News" | "Recaps" | "Interviews" | "Features" | "Lifestyle"

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  category: ArticleCategory
  author: string | null
  coverImage: string | null
  isPublished: boolean
  publishedAt: string | null
  readTimeMinutes: number | null
  createdAt: string
  updatedAt: string
}

const CATEGORIES: ArticleCategory[] = ["News", "Recaps", "Interviews", "Features", "Lifestyle"]

/** Normalize API rows (camelCase or snake_case) for the admin UI. */
function normalizeAdminArticle(raw: Record<string, unknown>): Article {
  const readRaw = raw.readTimeMinutes ?? raw.read_time_minutes
  let readTimeMinutes: number | null = null
  if (readRaw != null && readRaw !== "") {
    const n = typeof readRaw === "number" ? readRaw : parseInt(String(readRaw), 10)
    readTimeMinutes = Number.isNaN(n) ? null : n
  }
  return {
    id: String(raw.id ?? ""),
    slug: String(raw.slug ?? ""),
    title: String(raw.title ?? ""),
    excerpt: (raw.excerpt as string | null) ?? null,
    content: (raw.content as string | null) ?? null,
    category: raw.category as ArticleCategory,
    author: (raw.author as string | null) ?? null,
    coverImage: ((raw.coverImage ?? raw.cover_image) as string | null) ?? null,
    isPublished: Boolean(raw.isPublished ?? raw.is_published),
    publishedAt: ((raw.publishedAt ?? raw.published_at) as string | null) ?? null,
    readTimeMinutes,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  }
}

/** `YYYY-MM-DD` for `<input type="date" />` from an ISO timestamp. */
function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ── Form dialog ────────────────────────────────────────────────────────────

interface FormState {
  title: string
  slug: string
  excerpt: string
  content: string
  category: ArticleCategory
  author: string
  coverImage: string
  publishedDate: string
  readTimeMinutes: string
  isPublished: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "News",
  author: "",
  coverImage: "",
  publishedDate: "",
  readTimeMinutes: "",
  isPublished: false,
}

function ArticleFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: Article | null
  onClose: () => void
  onSaved: (a: Article) => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt ?? "",
        content: editing.content ?? "",
        category: editing.category,
        author: editing.author ?? "",
        coverImage: editing.coverImage ?? "",
        publishedDate: toDateInputValue(editing.publishedAt),
        readTimeMinutes:
          editing.readTimeMinutes != null ? String(editing.readTimeMinutes) : "",
        isPublished: editing.isPublished,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(null)
    setUploadError(null)
  }, [editing, open])

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
      if (url) setForm((f) => ({ ...f, coverImage: url }))
    } catch {
      setUploadError("Network error during upload.")
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const url = editing ? `/api/admin/articles/${editing.id}` : "/api/admin/articles"
      const method = editing ? "PATCH" : "POST"
      const body: Record<string, unknown> = {
        title: form.title || undefined,
        excerpt: form.excerpt || undefined,
        category: form.category,
        author: form.author || undefined,
        coverImage: form.coverImage.trim() || undefined,
        isPublished: form.isPublished,
      }
      if (editing) {
        body.content = form.content
      } else if (form.content.trim()) {
        body.content = form.content
      }
      if (form.slug) body.slug = form.slug
      if ((form.publishedDate ?? "").trim()) {
        body.publishedAt = new Date(`${form.publishedDate}T12:00:00`).toISOString()
      }
      const rt = parseInt((form.readTimeMinutes ?? "").trim(), 10)
      if (!Number.isNaN(rt) && rt >= 1) {
        body.readTimeMinutes = rt
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Save failed.")
      onSaved(data as Article)
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
            {editing ? "Edit Article" : "New Article"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
          {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ArticleCategory }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Author</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="e.g. Editorial Team"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Excerpt</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              rows={2} value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              maxLength={500}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Content (HTML/Markdown)</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              rows={10} value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={
                editing
                  ? "HTML or plain text (use a blank line between paragraphs)"
                  : "HTML or plain text (use a blank line between paragraphs)"
              }
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
            {uploadingCover && (
              <p className="mb-2 text-xs text-muted-foreground">Uploading cover…</p>
            )}
            {uploadError && (
              <p className="mb-2 text-xs text-destructive">{uploadError}</p>
            )}
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Image URL</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Published date</label>
              <p className="mb-1 text-xs text-muted-foreground">Optional; if empty and Published is on, the server sets the publication time to now when creating.</p>
              <input
                type="date"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.publishedDate}
                onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Reading time (minutes)</label>
              <p className="mb-1 text-xs text-muted-foreground">Optional; shown on the site as e.g. &quot;5 min read&quot;.</p>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={form.readTimeMinutes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, readTimeMinutes: e.target.value }))}
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Slug (auto-generated if blank)</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="my-article-slug"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox" checked={form.isPublished}
              onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-foreground">Published</span>
          </label>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-card px-6 py-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminNewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/articles?limit=50", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        const rows = Array.isArray(data.data) ? data.data : []
        setArticles(rows.map((row: Record<string, unknown>) => normalizeAdminArticle(row)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-open create dialog when navigated here with ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null)
      setDialogOpen(true)
      router.replace("/admin/cms/news")
    }
  }, [searchParams, router])

  async function handleTogglePublished(article: Article) {
    await fetch(`/api/admin/articles/${article.id}/toggle-published`, { method: "PATCH" })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" })
      load()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminPageWrapper
      title="News & Articles"
      description={`${articles.length} article${articles.length !== 1 ? "s" : ""} total`}
      breadcrumb={[
        { label: "Admin", href: "/admin"           },
        { label: "CMS",   href: "/admin/cms/news"  },
        { label: "News & Articles"                 },
      ]}
      actions={
        <button
          onClick={() => { setEditing(null); setDialogOpen(true) }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Article
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
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">No articles yet</p>
            <button
              onClick={() => { setEditing(null); setDialogOpen(true) }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create your first article
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Published</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{article.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{article.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        article.isPublished
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {article.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublished(article)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                        >
                          {article.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => { setEditing(article); setDialogOpen(true) }}
                          className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          disabled={deletingId === article.id}
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

      <ArticleFormDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={() => { setDialogOpen(false); load() }}
      />
    </AdminPageWrapper>
  )
}
