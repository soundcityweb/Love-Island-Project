import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import type { ArticleSummary } from "@/app/types/article"
import { cn } from "@/lib/utils"
import { formatDate } from "@/app/lib/news"
import {
  ArticleShareFooter,
  RelatedArticlesSection,
} from "@/components/news/article-detail"
import type { ArticleCardProps } from "@/components/news/article-card"
import { ReadingProgress } from "@/components/news/reading-progress"
import { ShareBar } from "@/components/news/share-bar"
import type { PodcastEpisodePublic } from "@/app/lib/podcasts-public"
import { PodcastAudio } from "@/app/podcasts/[slug]/podcast-audio"
import { PodcastVideoPlayer } from "@/app/podcasts/[slug]/podcast-video"

// ─── Hero (taller cover, layered gradients, glass label) ───────────────────

function PodcastEpisodeHero({
  image,
  title,
  backHref = "/podcasts",
  backLabel = "Back to Podcast",
}: {
  image: string
  title: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <section
      className="relative min-h-[480px] h-[58vh] w-full lg:min-h-[600px] lg:h-[70vh]"
      aria-label="Episode cover"
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

      <Link
        href={backHref}
        className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/50 lg:left-8"
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

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-[680px] lg:max-w-[720px]">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/95 shadow-sm backdrop-blur-md">
            Episode
          </span>
          <h1 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
            {title}
          </h1>
        </div>
      </div>
    </section>
  )
}

// ─── Slim meta row (date + share) ───────────────────────────────────────────

function PodcastMediaLabeledBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}

function PodcastEpisodeMeta({ date, title }: { date: string; title: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Released
        </p>
        <p className="mt-1 text-base font-medium text-foreground">
          <time dateTime={date}>{formatDate(date)}</time>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          aria-hidden
        >
          Share
        </span>
        <ShareBar title={title} compact />
      </div>
    </div>
  )
}

// ─── Notes: comfortable reading, optional multi-paragraph ───────────────────

function PodcastNotesBody({ text }: { text: string }) {
  const trimmed = text.trim()
  const blocks = trimmed.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)

  const proseBody =
    "prose-p:text-[17px] prose-p:leading-[1.9] prose-p:text-muted-foreground prose-p:mb-0"

  if (blocks.length <= 1) {
    return (
      <div
        className={`
          prose prose-xl mx-auto max-w-[40rem]
          prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
          ${proseBody}
          prose-p:first-of-type:text-[18px] prose-p:first-of-type:font-medium prose-p:first-of-type:leading-[1.75] prose-p:first-of-type:text-foreground/95
        `}
      >
        <p className="whitespace-pre-wrap">{trimmed}</p>
      </div>
    )
  }

  return (
    <div
      className={`
        prose prose-xl mx-auto max-w-[40rem] space-y-6
        prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
        ${proseBody}
      `}
    >
      {blocks.map((para, i) => (
        <p
          key={i}
          className={
            i === 0
              ? "text-[18px] font-medium leading-[1.75] text-foreground/95 first:mt-0"
              : "text-[17px] leading-[1.9] text-muted-foreground"
          }
        >
          {para}
        </p>
      ))}
    </div>
  )
}

const EXPLORE_MORE_ARTICLES: ArticleSummary[] = [
  {
    slug: "explore-vote",
    title: "Vote",
    excerpt: "Back your favourites and shape the villa.",
    image: "/placeholder.svg",
    category: "Features",
    date: "2026-03-01",
    readTime: "1 min read",
  },
  {
    slug: "explore-shop",
    title: "Shop",
    excerpt: "Official Love Island Nigeria gear and drops.",
    image: "/placeholder.svg",
    category: "Lifestyle",
    date: "2026-03-01",
    readTime: "1 min read",
  },
  {
    slug: "explore-news",
    title: "News",
    excerpt: "Recaps, interviews, and stories from the show.",
    image: "/placeholder.svg",
    category: "News",
    date: "2026-03-01",
    readTime: "1 min read",
  },
]

/** Same card props pattern as News “More Stories” grid; text-only (no image), CTA Explore. */
function exploreCardProps(article: ArticleSummary): Partial<Omit<ArticleCardProps, "article">> {
  switch (article.slug) {
    case "explore-vote":
      return {
        badgeLabel: "Vote",
        metaLine: "Fan favourite",
        ctaGridText: "Explore →",
        showImage: false,
      }
    case "explore-shop":
      return {
        badgeLabel: "Shop",
        metaLine: "Official store",
        ctaGridText: "Explore →",
        showImage: false,
      }
    case "explore-news":
      return {
        badgeLabel: "News",
        metaLine: "Stay updated",
        ctaGridText: "Explore →",
        showImage: false,
      }
    default:
      return { showImage: false }
  }
}

function exploreHref(article: ArticleSummary): string {
  switch (article.slug) {
    case "explore-vote":
      return "/vote"
    case "explore-shop":
      return "/shop"
    case "explore-news":
      return "/news"
    default:
      return "/"
  }
}

function crossLinksToSummaries(
  links: NonNullable<PodcastEpisodePublic["crossLinks"]>,
  episodeDate: string,
): ArticleSummary[] {
  return links.map((link, i) => ({
    slug: `explore-cross-${i}`,
    title: link.label.trim() || "Link",
    excerpt: "",
    image: "/placeholder.svg",
    category: "News",
    date: episodeDate,
    readTime: "",
  }))
}

export interface PodcastDetailProps {
  episode: PodcastEpisodePublic
}

export function PodcastDetail({ episode }: PodcastDetailProps) {
  const heroImage = episode.thumbnailUrl?.trim() ? episode.thumbnailUrl : "/placeholder.svg"
  const audioSrc = episode.audioUrl?.trim() ?? ""
  const videoSrc = episode.videoUrl?.trim() ?? ""
  const hasMedia = Boolean(videoSrc || audioSrc)

  const rawCross = episode.crossLinks?.filter((l) => l.label?.trim() && l.url?.trim()) ?? []
  const useCrossLinks = rawCross.length > 0

  const exploreArticles = useCrossLinks
    ? crossLinksToSummaries(rawCross, episode.createdAt)
    : EXPLORE_MORE_ARTICLES

  const exploreGetHref = useCrossLinks
    ? (article: ArticleSummary) => {
        const m = /^explore-cross-(\d+)$/.exec(article.slug)
        const i = m ? parseInt(m[1], 10) : -1
        return i >= 0 && rawCross[i] ? rawCross[i].url.trim() : "/"
      }
    : exploreHref

  const exploreGetArticleCardProps = useCrossLinks
    ? (_article: ArticleSummary) => ({
        ctaGridText: "Visit →",
        showExcerpt: false,
        showMetaLine: false,
        showDateRow: false,
        showImageBadge: false,
        showImage: false,
      })
    : exploreCardProps

  return (
    <>
      <ReadingProgress />

      <main className="bg-background">
        <PodcastEpisodeHero image={heroImage} title={episode.title} />

        <article className="relative z-10 -mt-8 rounded-t-[1.75rem] border border-border/50 bg-background px-6 pb-16 pt-12 shadow-[0_-12px_40px_-18px_rgba(22,8,16,0.12)] sm:px-8 lg:-mt-10 lg:mx-auto lg:max-w-[820px] lg:rounded-t-[2rem] lg:px-8 lg:pb-20 lg:pt-14 xl:max-w-[860px]">
          {/*
           * Reading rail matches News `ArticleDetail`: meta, media, notes, and share
           * share one max width so the player is full-width of the content column.
           */}
          <div className="mx-auto w-full max-w-[740px]">
            <PodcastEpisodeMeta date={episode.createdAt} title={episode.title} />

            {hasMedia ? (
              <section className="mt-12 w-full space-y-12" aria-label="Episode media">
                {videoSrc ? (
                  <PodcastMediaLabeledBlock label="Watch Episode">
                    <PodcastVideoPlayer url={videoSrc} title={episode.title} />
                  </PodcastMediaLabeledBlock>
                ) : null}
                {audioSrc ? (
                  <PodcastMediaLabeledBlock label="Listen Episode">
                    <PodcastAudio src={audioSrc} title={episode.title} />
                  </PodcastMediaLabeledBlock>
                ) : null}
              </section>
            ) : null}

            {episode.notes?.trim() ? (
              <div
                className={cn(
                  "mt-12",
                  hasMedia && "border-t border-border/40 pt-12",
                )}
              >
                <PodcastNotesBody text={episode.notes.trim()} />
              </div>
            ) : null}

            <ArticleShareFooter
              title={episode.title}
              headline="Enjoyed this episode?"
              subline="Share it with friends and fellow fans."
            />
          </div>
        </article>

        <RelatedArticlesSection
          articles={exploreArticles}
          title="Explore More"
          showViewAll={false}
          aria-label="Explore more"
          getHref={exploreGetHref}
          getArticleCardProps={exploreGetArticleCardProps}
        />
      </main>
    </>
  )
}
