import type { Metadata } from "next"
import Link from "next/link"
import { ArticleCard } from "@/components/news/article-card"
import {
  NewsletterCtaSection,
  type NewsletterFeedback,
} from "@/components/news/newsletter-cta-section"
import {
  buildNewsUrl,
  CATEGORIES,
  fetchArticles,
  PAGE_SIZE,
} from "@/app/lib/news"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchParams = Promise<{
  page?: string
  category?: string
  unsubscribed?: string
  unsubscribe_error?: string
}>

type Props = { searchParams: SearchParams }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSearchParams(raw: { page?: string; category?: string }) {
  const page = Math.max(1, parseInt(raw.page ?? "1", 10) || 1)
  const category = CATEGORIES.includes(
    raw.category as (typeof CATEGORIES)[number],
  )
    ? (raw.category ?? "All")
    : "All"
  return { page, category }
}

// ---------------------------------------------------------------------------
// Metadata (includes OpenGraph, Twitter card, and pagination rel links)
// ---------------------------------------------------------------------------

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = await searchParams
  const { page, category } = parseSearchParams(raw)
  const { total, totalPages } = await fetchArticles(page, category)

  const isFirstPage = page === 1
  const pageLabel = isFirstPage ? "" : ` – Page ${page}`
  const categoryLabel = category !== "All" ? ` · ${category}` : ""

  const title = `News & Articles${categoryLabel}${pageLabel} | Love Island Nigeria`
  const description =
    "Stay up to date with the latest Love Island Nigeria news, recaps, exclusive interviews, and behind-the-scenes content."
  const canonical = buildNewsUrl(page, category)

  return {
    title,
    description,
    keywords: [
      "Love Island Nigeria",
      "Love Island news",
      "villa recaps",
      "islander interviews",
      "reality TV",
      ...(category !== "All" ? [category] : []),
    ],
    alternates: {
      canonical,
      ...(page > 1 && { prev: buildNewsUrl(page - 1, category) }),
      ...(page < totalPages && { next: buildNewsUrl(page + 1, category) }),
    },
    openGraph: {
      type: "website",
      url: `https://loveislandnigeria.com${canonical}`,
      title,
      description,
      siteName: "Love Island Nigeria",
      images: [
        {
          url: "https://loveislandnigeria.com/images/og-news.jpg",
          width: 1200,
          height: 630,
          alt: "Love Island Nigeria – News & Articles",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://loveislandnigeria.com/images/og-news.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "article:total": String(total),
    },
  }
}

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------

function NewsListingJsonLd({
  articles,
  page,
  category,
}: {
  articles: { slug: string; title: string }[]
  page: number
  category: string
}) {
  const base = "https://loveislandnigeria.com"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Love Island Nigeria News & Articles",
    url: `${base}${buildNewsUrl(page, category)}`,
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + index + 1,
      url: `${base}/news/${article.slug}`,
      name: article.title,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ---------------------------------------------------------------------------
// Pagination component (Link-based for SEO)
// ---------------------------------------------------------------------------

function Pagination({
  page,
  totalPages,
  total,
  category,
}: {
  page: number
  totalPages: number
  total: number
  category: string
}) {
  if (totalPages <= 1) return null

  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
  const showEllipsis = totalPages > 5

  const visiblePages = showEllipsis
    ? [
        ...new Set([
          1,
          ...(page > 2 ? [page - 1] : []),
          page,
          ...(page < totalPages - 1 ? [page + 1] : []),
          totalPages,
        ]),
      ]
    : pageNumbers

  return (
    <nav aria-label="Pagination" className="border-t border-border px-4 md:px-8 py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> articles
          </p>

          <div className="flex items-center gap-2">
            {/* Previous */}
            {page > 1 ? (
              <Link
                href={buildNewsUrl(page - 1, category)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                aria-label="Previous page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </Link>
            ) : (
              <span
                className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-border text-muted-foreground opacity-50"
                aria-disabled="true"
                aria-label="Previous page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {visiblePages.map((p, i) => {
                const prev = visiblePages[i - 1]
                const showDots = prev !== undefined && p - prev > 1
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showDots && (
                      <span className="px-1 text-muted-foreground" aria-hidden>
                        …
                      </span>
                    )}
                    {p === page ? (
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full btn-gradient text-sm font-black text-white shadow-warm"
                        aria-current="page"
                        aria-label={`Page ${p}, current`}
                      >
                        {p}
                      </span>
                    ) : (
                      <Link
                        href={buildNewsUrl(p, category)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Go to page ${p}`}
                      >
                        {p}
                      </Link>
                    )}
                  </span>
                )
              })}
            </div>

            {/* Next */}
            {page < totalPages ? (
              <Link
                href={buildNewsUrl(page + 1, category)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                aria-label="Next page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ) : (
              <span
                className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-border text-muted-foreground opacity-50"
                aria-disabled="true"
                aria-label="Next page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function NewsPage({ searchParams }: Props) {
  const raw = await searchParams
  const { page, category } = parseSearchParams(raw)
  const { articles, total, totalPages } = await fetchArticles(page, category)

  const [featuredArticle, ...gridArticles] =
    page === 1 ? articles : ([null, ...articles] as const)
  const safeGridArticles = gridArticles.filter((a) => a !== null)

  const newsletterFeedback: NewsletterFeedback =
    raw.unsubscribed === "1" ? "unsubscribed" : raw.unsubscribe_error === "1" ? "error" : null

  return (
    <>
      <NewsListingJsonLd articles={articles} page={page} category={category} />

      <main className="min-h-screen bg-background">
        {/* ── Villa Buzz Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
          <div className="absolute inset-0 bg-li-sunset" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

          <div className="relative mx-auto max-w-7xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
              ✦ &nbsp;Villa Buzz &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
            </p>
            <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
              Hot Off<br className="hidden sm:block" /> the Press
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
              Drama. Tears. Plot twists you never saw coming. Stay locked in for
              every development — straight from inside the villa.
            </p>

            {/* Stat divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px max-w-[80px] flex-1 bg-white/25" />
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                All the Drama &nbsp;·&nbsp; Straight from the Villa &nbsp;·&nbsp; Season 1
              </p>
            </div>
          </div>
        </section>

        {/* ── Category filter ─────────────────────────────────────────────── */}
        <section
          className="border-b border-border bg-card px-4 py-4 md:px-8 lg:px-12"
          aria-label="Filter articles by category"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" role="list">
              {CATEGORIES.map((cat) => {
                const isActive = cat === category
                return (
                  <Link
                    key={cat}
                    href={buildNewsUrl(1, cat)}
                    role="listitem"
                    aria-current={isActive ? "true" : undefined}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "btn-gradient text-white shadow-warm"
                        : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Articles ────────────────────────────────────────────────────── */}
        <section className="px-4 py-16 md:px-8 md:py-24 lg:px-12" aria-label="Article listing">
          <div className="mx-auto max-w-7xl">
            {articles.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-2xl font-black text-foreground">
                  The Villa is quiet right now.
                </p>
                <p className="mt-2 text-base text-muted-foreground">
                  No stories found{category !== "All" ? ` in ${category}` : ""}. Check back soon — drama never stays away for long.
                </p>
              </div>
            ) : (
              <>
                {/* Featured article — only on page 1 */}
                {featuredArticle && (
                  <ArticleCard article={featuredArticle} featured priority />
                )}

                {/* Article grid */}
                {safeGridArticles.length > 0 && (
                  <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 ${featuredArticle ? "mt-10" : ""}`}>
                    {safeGridArticles.map((article, i) => (
                      <ArticleCard
                        key={article.slug}
                        article={article}
                        priority={i < 3}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Pagination page={page} totalPages={totalPages} total={total} category={category} />

        {/* ── Newsletter CTA (feedback + scroll lives in client section) ─── */}
        <NewsletterCtaSection feedback={newsletterFeedback} />

      </main>
    </>
  )
}
