import type {
  Article,
  ArticleCategory,
  ArticleSummary,
  PaginatedArticles,
} from "@/app/types/article"
import { resolveProductImageUrl } from "@/lib/resolve-product-image-url"

export const PAGE_SIZE = 6

export const CATEGORIES: Array<"All" | ArticleCategory> = [
  "All",
  "News",
  "Recaps",
  "Interviews",
  "Features",
  "Lifestyle",
]

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Builds the canonical URL for the news listing page.
 * Omits default params (page 1, category "All") to keep URLs clean.
 */
export function buildNewsUrl(page: number, category: string): string {
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  if (category !== "All") params.set("category", category)
  const query = params.toString()
  return query ? `/news?${query}` : "/news"
}

const API_BASE =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface ApiArticle {
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  category: ArticleCategory
  publishedAt: string | null
  readTimeMinutes?: number | null
  /** Some stacks serialize DB columns as snake_case in JSON */
  read_time_minutes?: number | null
  author: string | null
  content: string | null
  createdAt: string
}

function pickReadMinutes(row: ApiArticle): number | null {
  const v: unknown = row.readTimeMinutes ?? row.read_time_minutes
  if (v == null || v === "") return null
  const n = typeof v === "number" ? v : parseInt(String(v).trim(), 10)
  return Number.isNaN(n) ? null : n
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Renders stored body on the public site. HTML passes through; plain text gets
 * paragraphs from blank lines and single newlines become &lt;br /&gt;.
 */
function articleBodyToHtml(raw: string | null | undefined): string {
  const t = (raw ?? "").trim()
  if (!t) return ""
  if (/<[a-z][\s\S]*>/i.test(t)) return t
  return t
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

interface ApiPaginated {
  data: ApiArticle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function isoCalendarDate(publishedAt: string | null, createdAt: string): string {
  const raw = publishedAt || createdAt
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function mapToSummary(row: ApiArticle): ArticleSummary {
  const minutes = pickReadMinutes(row)
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    image: resolveProductImageUrl(row.coverImage),
    category: row.category,
    date: isoCalendarDate(row.publishedAt, row.createdAt),
    readTime: minutes != null ? `${minutes} min` : "— min",
  }
}

function mapToArticle(row: ApiArticle): Article {
  const summary = mapToSummary(row)
  return {
    ...summary,
    author: row.author ?? "Editorial Team",
    content: articleBodyToHtml(row.content),
  }
}

/** Absolute URL for OG / JSON-LD when `image` may be site-relative or absolute (e.g. Cloudinary). */
export function absoluteArticleImage(siteUrl: string, image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  const path = image.startsWith("/") ? image : `/${image}`
  return `${siteUrl.replace(/\/$/, "")}${path}`
}

// ---------------------------------------------------------------------------
// Data access — Nest public `/api/articles` (same host as Next server env).
// ---------------------------------------------------------------------------

/**
 * Returns a paginated, optionally filtered slice of published articles.
 */
export async function fetchArticles(
  page: number,
  category: string = "All",
): Promise<PaginatedArticles> {
  const params = new URLSearchParams()
  params.set("page", String(Math.max(1, page)))
  params.set("limit", String(PAGE_SIZE))
  if (category !== "All") params.set("category", category)

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/articles?${params.toString()}`, {
      cache: "no-store",
    })
  } catch {
    return { articles: [], total: 0, page: 1, totalPages: 1 }
  }

  if (!res.ok) {
    return { articles: [], total: 0, page: 1, totalPages: 1 }
  }

  const json = (await res.json().catch(() => null)) as ApiPaginated | null
  if (!json?.data) {
    return { articles: [], total: 0, page: 1, totalPages: 1 }
  }

  const articles = json.data.map(mapToSummary)
  const totalPages = Math.max(1, json.totalPages ?? 1)
  const safePage = Math.min(Math.max(1, json.page ?? page), totalPages)

  return {
    articles,
    total: json.total ?? articles.length,
    page: safePage,
    totalPages,
  }
}

/**
 * Returns the full published article for the given slug, or `null` if not found.
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/articles/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
  } catch {
    return null
  }

  if (!res.ok) return null

  const row = (await res.json().catch(() => null)) as ApiArticle | null
  if (!row?.slug) return null

  return mapToArticle(row)
}

/**
 * Returns up to `limit` published articles excluding the given slug.
 */
export async function fetchRelatedArticles(
  excludeSlug: string,
  limit = 3,
): Promise<ArticleSummary[]> {
  const params = new URLSearchParams()
  params.set("page", "1")
  params.set("limit", "50")

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/articles?${params.toString()}`, {
      cache: "no-store",
    })
  } catch {
    return []
  }

  if (!res.ok) return []

  const json = (await res.json().catch(() => null)) as ApiPaginated | null
  const rows = json?.data ?? []

  return rows
    .filter((r) => r.slug !== excludeSlug)
    .slice(0, limit)
    .map(mapToSummary)
}

/** All published article slugs — used by `generateStaticParams` on the detail page. */
export async function getAllSlugs(): Promise<string[]> {
  const slugs: string[] = []
  let page = 1
  const limit = 50

  try {
    while (true) {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))

      const res = await fetch(`${API_BASE}/api/articles?${params.toString()}`, {
        cache: "no-store",
      })
      if (!res.ok) break

      const json = (await res.json().catch(() => null)) as ApiPaginated | null
      const rows = json?.data ?? []
      for (const r of rows) slugs.push(r.slug)

      const totalPages = json?.totalPages ?? 1
      if (page >= totalPages || rows.length < limit) break
      page += 1
    }
  } catch {
    /* ignore */
  }

  return slugs
}
