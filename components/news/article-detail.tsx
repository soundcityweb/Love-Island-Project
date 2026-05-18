import Link from "next/link"
import Image from "next/image"
import type { Article, ArticleSummary } from "@/app/types/article"
import { formatDate } from "@/app/lib/news"
import { cn } from "@/lib/utils"
import { ArticleCard, type ArticleCardProps } from "@/components/news/article-card"
import { ReadingProgress } from "@/components/news/reading-progress"
import { ShareBar } from "@/components/news/share-bar"

// ─── Public props ────────────────────────────────────────────────────────────

export interface ArticleDetailProps {
  article: Article
  relatedArticles: ArticleSummary[]
}

// ─── Section: Hero ───────────────────────────────────────────────────────────

export type ArticleHeroProps = {
  image: string
  title: string
  /** Badge label above the title (e.g. category or “Episode”). */
  category: string
  backHref?: string
  backLabel?: string
}

export function ArticleHero({
  image,
  title,
  category,
  backHref = "/news",
  backLabel = "Back to News",
}: ArticleHeroProps) {
  return (
    <section
      className="relative h-[52vh] min-h-[420px] w-full lg:h-[62vh] lg:min-h-[520px]"
      aria-label="Article cover image"
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Multi-stop gradient for legible text over any image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <Link
        href={backHref}
        className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60 lg:left-8"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        {backLabel}
      </Link>

      <div className="absolute inset-x-0 bottom-0 px-6 pb-10 lg:px-8 lg:pb-14">
        <div className="mx-auto max-w-[740px]">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            {category}
          </span>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
            {title}
          </h1>
        </div>
      </div>
    </section>
  )
}

// ─── Section: Byline ─────────────────────────────────────────────────────────

export type ArticleBylineProps = Pick<Article, "author" | "date" | "title"> & {
  /** Omit or pass null to hide the read-time segment. */
  readTime?: string | null
}

export function ArticleByline({ author, date, readTime, title }: ArticleBylineProps) {
  return (
    <div className="flex flex-wrap items-center gap-y-3 border-b border-border pb-6">
      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          aria-hidden
        >
          {author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">
            <time dateTime={date}>{formatDate(date)}</time>
            {readTime ? (
              <>
                <span className="mx-2" aria-hidden>·</span>
                <span>{readTime}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      {/* Share (right-aligned) */}
      <div className="ml-auto flex items-center gap-2">
        <span
          className="mr-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          aria-hidden
        >
          Share
        </span>
        <ShareBar title={title} compact />
      </div>
    </div>
  )
}

// ─── Section: Body ───────────────────────────────────────────────────────────

function ArticleBody({ content }: { content: string }) {
  return (
    /*
     * Reading layout: max-w-[72ch] ~= 720px at 16px base, the sweet spot for
     * sustained reading comfort (WCAG 1.4.8 recommends ≤80 chars per line).
     * prose-xl gives 20px body text; all token values map to CSS variables so
     * they automatically respond to the brand theme.
     */
    <div
      className="
        prose prose-xl mx-auto mt-10 max-w-[72ch]

        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
        prose-h2:mb-3 prose-h2:mt-12 prose-h2:text-2xl
        prose-h3:mt-8 prose-h3:text-xl

        prose-p:text-[17px] prose-p:leading-[1.85] prose-p:text-muted-foreground
        prose-p:first-of-type:text-[19px] prose-p:first-of-type:font-medium
        prose-p:first-of-type:leading-[1.75] prose-p:first-of-type:text-foreground

        prose-a:text-primary prose-a:no-underline prose-a:font-medium
        hover:prose-a:underline

        prose-blockquote:not-italic prose-blockquote:rounded-r-xl
        prose-blockquote:border-l-[3px] prose-blockquote:border-primary
        prose-blockquote:bg-muted/40 prose-blockquote:px-6 prose-blockquote:py-4
        prose-blockquote:text-foreground prose-blockquote:shadow-sm

        prose-strong:text-foreground
        prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm
        prose-li:text-[17px] prose-li:leading-[1.8] prose-li:text-muted-foreground
        prose-hr:border-border
      "
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

// ─── Section: Share footer ────────────────────────────────────────────────────

export function ArticleShareFooter({
  title,
  headline = "Enjoyed this story?",
  subline = "Share it with friends and fellow fans.",
}: {
  title: string
  headline?: string
  subline?: string
}) {
  return (
    <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-foreground">{headline}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{subline}</p>
      </div>
      <ShareBar title={title} />
    </div>
  )
}

// ─── Section: Related articles ───────────────────────────────────────────────

type RelatedArticlesSectionProps = {
  articles: ArticleSummary[]
  /** Section heading (default “More Stories”). */
  title?: string
  /** When false, the “View all” link is omitted (e.g. fixed promo cards). */
  showViewAll?: boolean
  viewAllHref?: string
  viewAllLabel?: string
  /** Override link target per card (default `/news/{slug}`). */
  getHref?: (article: ArticleSummary) => string
  /** Extra props forwarded to each `ArticleCard` (e.g. podcast overrides). */
  articleCardProps?: Partial<Omit<ArticleCardProps, "article">>
  /** Per-card overrides; merged after `articleCardProps` (later wins). */
  getArticleCardProps?: (article: ArticleSummary) => Partial<Omit<ArticleCardProps, "article">>
  /** Accessible section label */
  "aria-label"?: string
  /** Optional copy under the title (e.g. podcast “Explore More” intro). */
  description?: string | null
  /** Merged onto the default section surface classes. */
  sectionClassName?: string
  /** Override heading styles (default matches news). */
  titleClassName?: string
  /** Override grid gap / columns if needed. */
  gridClassName?: string
}

export function RelatedArticlesSection({
  articles,
  title = "More Stories",
  showViewAll = true,
  viewAllHref = "/news",
  viewAllLabel = "View all →",
  getHref,
  articleCardProps,
  getArticleCardProps,
  "aria-label": ariaLabel = "Related articles",
  description,
  sectionClassName,
  titleClassName,
  gridClassName,
}: RelatedArticlesSectionProps) {
  if (articles.length === 0) return null

  return (
    <section
      className={cn(
        "border-t border-border bg-card px-6 py-14 lg:px-8 lg:py-20",
        sectionClassName,
      )}
      aria-label={ariaLabel}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2
              className={cn(
                "text-2xl font-bold tracking-tight text-card-foreground",
                titleClassName,
              )}
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {showViewAll ? (
            <Link
              href={viewAllHref}
              className="shrink-0 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              {viewAllLabel}
            </Link>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",
            gridClassName,
          )}
        >
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              href={getHref?.(article)}
              {...articleCardProps}
              {...getArticleCardProps?.(article)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ArticleDetail({ article, relatedArticles }: ArticleDetailProps) {
  return (
    <>
      <ReadingProgress />


      <main className="bg-background">
        <ArticleHero
          image={article.image}
          title={article.title}
          category={article.category}
        />

        {/*
         * Long-form reading column — centred, constrained to match ArticleBody
         * so the byline and share footer visually align with the prose.
         */}
        <article className="px-6 py-10 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-[740px]">
            <ArticleByline
              author={article.author}
              date={article.date}
              readTime={article.readTime}
              title={article.title}
            />

            <ArticleBody content={article.content} />

            <ArticleShareFooter title={article.title} />
          </div>
        </article>

        <RelatedArticlesSection articles={relatedArticles} />
      </main>

    </>
  )
}
