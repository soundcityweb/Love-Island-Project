"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { CmsHtmlEditor } from "@/components/admin/cms-html-editor"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const DEFAULT_READONLY_SLUGS = new Set(["privacy-policy", "terms-conditions"])

type CmsPageStatus = "draft" | "published"

interface CmsPageDetail {
  id: string
  title: string
  slug: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
  status: CmsPageStatus
  updatedAt: string
}

function normalizePage(raw: Record<string, unknown>): CmsPageDetail {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    content: String(raw.content ?? ""),
    metaTitle: (raw.metaTitle ?? raw.meta_title) as string | null,
    metaDescription: (raw.metaDescription ?? raw.meta_description) as string | null,
    status: (raw.status as CmsPageStatus) ?? "draft",
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  }
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z
    .string()
    .min(1, "Content is required.")
    .refine((s) => s.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Content cannot be empty.",
    }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["draft", "published"], {
    required_error: "Select Draft or Published.",
  }),
})

export default function AdminCmsPageEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState<CmsPageDetail | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [status, setStatus] = useState<CmsPageStatus>("draft")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const titleReadonly = useMemo(
    () => page != null && DEFAULT_READONLY_SLUGS.has(page.slug),
    [page],
  )

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/cms-pages", { cache: "no-store" })
      if (!res.ok) {
        setPage(null)
        return
      }
      const data = await res.json()
      const rows = Array.isArray(data) ? data : []
      const found = rows.map((r: Record<string, unknown>) => normalizePage(r)).find((p) => p.id === id)
      if (!found) {
        setPage(null)
        return
      }
      setPage(found)
      setTitle(found.title)
      setContent(found.content)
      setMetaTitle(found.metaTitle ?? "")
      setMetaDescription(found.metaDescription ?? "")
      setStatus(found.status)
      setErrors({})
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!page) return

    const parsed = formSchema.safeParse({
      title: titleReadonly ? page.title : title,
      content,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      status,
    })

    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors({
        ...(flat.title?.[0] ? { title: flat.title[0] } : {}),
        ...(flat.content?.[0] ? { content: flat.content[0] } : {}),
        ...(flat.status?.[0] ? { status: flat.status[0] } : {}),
      })
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        content: parsed.data.content,
        metaTitle: parsed.data.metaTitle?.trim() ? parsed.data.metaTitle.trim() : null,
        metaDescription: parsed.data.metaDescription?.trim()
          ? parsed.data.metaDescription.trim()
          : null,
        status: parsed.data.status,
      }
      if (!titleReadonly) body.title = parsed.data.title

      const res = await fetch(`/api/admin/cms-pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(typeof (data as { message?: string }).message === "string" ? (data as { message: string }).message : "Save failed.")
        return
      }
      toast.success("Page saved.")
      const next = normalizePage(data as Record<string, unknown>)
      setPage(next)
      setStatus(next.status)
    } catch {
      toast.error("Network error while saving.")
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return null
  }

  if (loading) {
    return (
      <AdminPageWrapper title="Edit page" breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "…" }]}>
        <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
      </AdminPageWrapper>
    )
  }

  if (!page) {
    return (
      <AdminPageWrapper
        title="Page not found"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Static pages", href: "/admin/cms/pages" },
          { label: "Not found" },
        ]}
      >
        <p className="text-sm text-muted-foreground">This page does not exist or was removed.</p>
        <Link href="/admin/cms/pages" className="mt-4 inline-block text-sm text-primary underline">
          Back to list
        </Link>
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper
      title="Edit static page"
      description={page.title}
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Static pages", href: "/admin/cms/pages" },
        { label: page.title },
      ]}
    >
      <form onSubmit={handleSave} className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cms-title">Title</Label>
            <Input
              id="cms-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={titleReadonly}
              className={titleReadonly ? "bg-muted/50" : undefined}
            />
            {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
            {titleReadonly ? (
              <p className="text-xs text-muted-foreground">Title is fixed for this system page.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cms-slug">Slug</Label>
            <Input id="cms-slug" value={page.slug} readOnly className="bg-muted/50 font-mono text-sm" />
            <p className="text-xs text-muted-foreground">Slug cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <CmsHtmlEditor value={content} onChange={setContent} />
            {errors.content ? <p className="text-xs text-destructive">{errors.content}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cms-meta-title">Meta title</Label>
            <Input
              id="cms-meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Optional — overrides page title for SEO"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cms-meta-desc">Meta description</Label>
            <Textarea
              id="cms-meta-desc"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="Optional — shown in search results"
            />
          </div>

          <div className="space-y-3">
            <Label>Status</Label>
            <RadioGroup
              value={status}
              onValueChange={(v) => setStatus(v as CmsPageStatus)}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="st-draft" />
                <Label htmlFor="st-draft" className="font-normal cursor-pointer">
                  Draft
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="published" id="st-published" />
                <Label htmlFor="st-published" className="font-normal cursor-pointer">
                  Published
                </Label>
              </div>
            </RadioGroup>
            {errors.status ? <p className="text-xs text-destructive">{errors.status}</p> : null}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </AdminPageWrapper>
  )
}
