"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

type CmsPageStatus = "draft" | "published"

interface CmsPageRow {
  id: string
  title: string
  slug: string
  status: CmsPageStatus
  updatedAt: string
}

function normalizeRow(raw: Record<string, unknown>): CmsPageRow {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    status: (raw.status as CmsPageStatus) ?? "draft",
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  }
}

export default function AdminCmsPagesListPage() {
  const [pages, setPages] = useState<CmsPageRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/cms-pages", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        const rows = Array.isArray(data) ? data : []
        setPages(rows.map((row: Record<string, unknown>) => normalizeRow(row)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <AdminPageWrapper
      title="Static pages"
      description={`${pages.length} page${pages.length !== 1 ? "s" : ""}`}
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "CMS", href: "/admin/cms/pages" },
        { label: "Static pages" },
      ]}
      noPadding
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">No CMS pages found.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Run the database migration and <code className="rounded bg-muted px-1">npm run seed:cms-pages</code> in
            the API project.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last updated</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "published"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/cms/pages/${p.id}`}
                      className="inline-flex rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageWrapper>
  )
}
