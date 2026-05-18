/**
 * Supported article categories.
 * Extend this union when new categories are introduced.
 */
export type ArticleCategory =
  | "News"
  | "Recaps"
  | "Interviews"
  | "Features"
  | "Lifestyle"

/** Lightweight shape used in listing pages and related-article sections. */
export interface ArticleSummary {
  slug: string
  title: string
  excerpt: string
  image: string
  category: ArticleCategory
  /** ISO-8601 date string, e.g. "2026-03-08" */
  date: string
  /** Human-readable read-time estimate, e.g. "5 min read" */
  readTime: string
}

/** Full article shape including body content and author. */
export interface Article extends ArticleSummary {
  author: string
  /** HTML string rendered via dangerouslySetInnerHTML on the detail page */
  content: string
}

/** Paginated result wrapper returned by fetchArticles. */
export interface PaginatedArticles {
  articles: ArticleSummary[]
  total: number
  page: number
  totalPages: number
}
