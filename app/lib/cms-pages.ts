const API_BASE =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export type CmsPageStatus = "draft" | "published"

export interface PublicCmsPage {
  id: string
  title: string
  slug: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
  status: CmsPageStatus
  createdAt: string
  updatedAt: string
}

function normalizePage(raw: Record<string, unknown>): PublicCmsPage {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    content: String(raw.content ?? ""),
    metaTitle: (raw.metaTitle ?? raw.meta_title) as string | null,
    metaDescription: (raw.metaDescription ?? raw.meta_description) as string | null,
    status: (raw.status as CmsPageStatus) ?? "draft",
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  }
}

/** Published page only; returns null if missing or not published. */
export async function fetchPublishedCmsPageBySlug(
  slug: string,
): Promise<PublicCmsPage | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Record<string, unknown>
    return normalizePage(data)
  } catch {
    return null
  }
}
