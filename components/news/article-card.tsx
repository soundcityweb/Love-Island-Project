import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import type { ArticleSummary } from "@/app/types/article"
import { formatDate } from "@/app/lib/news"
import { cn } from "@/lib/utils"

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href)
}

function PodcastBadgeMediaIcon({ type }: { type: "video" | "audio" }) {
  if (type === "video") {
    return (
      <svg
        className="h-3 w-3 shrink-0 opacity-95"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8 5v14l11-7L8 5z" />
      </svg>
    )
  }
  return (
    <svg
      className="h-3 w-3 shrink-0 opacity-95"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 10v4c0 .55.45 1 1 1h3l4 4V5L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

function CardLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export interface ArticleCardProps {
  article: ArticleSummary
  /** Renders the wide featured layout (image + text side-by-side). */
  featured?: boolean
  /** Controls image loading strategy; set to "eager" for above-the-fold cards. */
  priority?: boolean
  /** Full link URL (default `/news/{slug}`). */
  href?: string
  /** Replaces the top meta line (default `{readTime} read`). */
  metaLine?: string
  /** Replaces the category badge text on the image (default `article.category`). */
  badgeLabel?: string
  /** Small icon before badge label (podcast listing: video vs audio). */
  badgeMedia?: "video" | "audio"
  /** Featured layout CTA (default “Read Story”). */
  ctaFeaturedText?: string
  /** Grid layout CTA (default “Read →”). */
  ctaGridText?: string
  /** When false, the excerpt paragraph is omitted (e.g. cross-links with label only). */
  showExcerpt?: boolean
  /** When false, the small meta line above the title is omitted. */
  showMetaLine?: boolean
  /** When false, the published date in the footer is omitted. */
  showDateRow?: boolean
  /** When false, the gradient badge on the image is omitted. */
  showImageBadge?: boolean
  /** When false, grid layout omits the image block (text-only card). */
  showImage?: boolean
  /** Tighter padding and typography (e.g. podcast Explore More). */
  compact?: boolean
}

export function ArticleCard({
  article,
  featured = false,
  priority = false,
  href: hrefProp,
  metaLine,
  badgeLabel,
  badgeMedia,
  ctaFeaturedText = "Read Story",
  ctaGridText = "Read →",
  showExcerpt = true,
  showMetaLine = true,
  showDateRow = true,
  showImageBadge = true,
  showImage = true,
  compact = false,
}: ArticleCardProps) {
  const href = hrefProp ?? `/news/${article.slug}`
  const badge = badgeLabel ?? article.category
  const meta = metaLine ?? `${article.readTime} read`
  const textOnlyGrid = !featured && !showImage
  /** Compact is opt-in; text-only cards still use full News card chrome unless `compact`. */
  const tightGrid = compact

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-card shadow-warm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg">
        <CardLink href={href} className="block">
          <div className="grid gap-0 lg:grid-cols-2">

            {/* Image column */}
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority={priority}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark gradient — always on */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/60 lg:via-black/20 lg:to-transparent" />
              {/* Warm coral tint from bottom/left */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent lg:bg-gradient-to-r lg:from-primary/20 lg:to-transparent" />

              {/* Category badge — on image */}
              {showImageBadge ? (
                <div className="absolute left-4 top-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full btn-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
                    {badge}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Text column */}
            <div className="flex flex-col justify-center p-6 lg:p-10">
              {showMetaLine ? (
                <p className="text-xs font-semibold text-muted-foreground">{meta}</p>
              ) : null}

              <h2
                className={cn(
                  "text-balance text-2xl font-black leading-tight tracking-tight text-card-foreground transition-colors duration-200 group-hover:text-primary lg:text-3xl xl:text-4xl",
                  showMetaLine ? "mt-3" : "mt-0",
                )}
              >
                {article.title}
              </h2>

              {showExcerpt && article.excerpt ? (
                <p className="mt-4 line-clamp-3 text-pretty leading-relaxed text-muted-foreground lg:text-base">
                  {article.excerpt}
                </p>
              ) : null}

              <div
                className={cn(
                  "flex items-center",
                  showExcerpt && article.excerpt ? "mt-6" : "mt-5",
                  showDateRow ? "justify-between" : "justify-end",
                )}
              >
                {showDateRow ? (
                  <time dateTime={article.date} className="text-sm text-muted-foreground">
                    {formatDate(article.date)}
                  </time>
                ) : null}
                <span className="inline-flex items-center gap-1 text-sm font-black text-primary transition-all duration-200 group-hover:gap-2">
                  {ctaFeaturedText} <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </div>
        </CardLink>

        {/* Gradient accent bar — slides in on hover */}
        <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-primary via-accent to-yellow-400 transition-all duration-500 group-hover:w-full" />
      </article>
    )
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden bg-card transition-all duration-300",
        tightGrid
          ? "rounded-xl border border-border/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
          : "rounded-2xl shadow-warm hover:-translate-y-1.5 hover:shadow-warm-lg",
      )}
    >
      <CardLink href={href} className="block">
        {/* Image */}
        {showImage ? (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/25 to-transparent" />

            {showImageBadge ? (
              <div className="absolute left-3 top-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full btn-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm",
                    badgeMedia ? "gap-1.5" : "gap-0",
                  )}
                >
                  {badgeMedia ? <PodcastBadgeMediaIcon type={badgeMedia} /> : null}
                  {badge}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Text content — matches image+text grid cards; text-only uses same type scale when not `compact`. */}
        <div className={tightGrid ? "p-4" : "p-5"}>
          {textOnlyGrid && showImageBadge ? (
            <span
              className={cn(
                "mb-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm",
                badgeMedia ? "gap-1.5" : "gap-0",
                tightGrid
                  ? "border border-border bg-muted/60 text-muted-foreground"
                  : "btn-gradient text-white",
              )}
            >
              {badgeMedia ? <PodcastBadgeMediaIcon type={badgeMedia} /> : null}
              {badge}
            </span>
          ) : null}

          {showMetaLine ? (
            <p
              className={cn(
                "font-semibold text-muted-foreground",
                tightGrid ? "text-[11px] leading-tight" : "text-xs",
              )}
            >
              {meta}
            </p>
          ) : null}

          <h3
            className={cn(
              "text-balance leading-snug tracking-tight text-card-foreground transition-colors duration-200 group-hover:text-primary",
              tightGrid ? "text-base font-bold" : "text-xl font-black",
              showMetaLine || (textOnlyGrid && showImageBadge) ? "mt-2" : "mt-0",
            )}
          >
            {article.title}
          </h3>

          {showExcerpt && article.excerpt ? (
            <p
              className={cn(
                "line-clamp-2 leading-relaxed text-muted-foreground",
                tightGrid ? "mt-1.5 text-xs" : "mt-2 text-sm",
              )}
            >
              {article.excerpt}
            </p>
          ) : null}

          <div
            className={cn(
              "flex items-center",
              showExcerpt && article.excerpt ? (tightGrid ? "mt-3" : "mt-4") : tightGrid ? "mt-3" : "mt-5",
              showDateRow ? "justify-between" : "justify-end",
            )}
          >
            {showDateRow ? (
              <time
                dateTime={article.date}
                className={cn("text-muted-foreground", tightGrid ? "text-[11px]" : "text-xs")}
              >
                {formatDate(article.date)}
              </time>
            ) : null}
            <span
              className={cn(
                "font-black text-primary transition-all duration-200",
                tightGrid ? "text-[11px]" : "text-xs",
                showDateRow ? "opacity-0 group-hover:opacity-100" : "opacity-100",
              )}
            >
              {ctaGridText}
            </span>
          </div>
        </div>
      </CardLink>

      <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-primary via-accent to-yellow-400 transition-all duration-500 group-hover:w-full" />
    </article>
  )
}
