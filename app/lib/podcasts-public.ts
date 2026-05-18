import type { ArticleCardProps } from "@/components/news/article-card"
import type { ArticleSummary } from "@/app/types/article"
import { previewNotes } from "@/app/podcasts/preview-notes"

/** Public podcast episode as returned by GET /api/podcasts. */
export type PodcastEpisodePublic = {
  id: string
  title: string
  slug: string
  audioUrl: string | null
  videoUrl?: string | null
  notes: string | null
  thumbnailUrl: string | null
  crossLinks: { label: string; url: string }[] | null
  status: string
  createdAt: string
}

const PLACEHOLDER_IMAGE = "/placeholder.svg"

/**
 * Maps a podcast episode to `ArticleSummary` for reuse of `ArticleCard`.
 * Always set `ArticleCard` overrides: `href`, `metaLine`, `badgeLabel`, CTA copy.
 */
export function podcastEpisodeToArticleSummary(ep: PodcastEpisodePublic): ArticleSummary {
  return {
    slug: ep.slug,
    title: ep.title,
    excerpt: previewNotes(ep.notes, 220),
    image: ep.thumbnailUrl?.trim() ? ep.thumbnailUrl : PLACEHOLDER_IMAGE,
    category: "News",
    date: ep.createdAt,
    readTime: "",
  }
}

function hasTrimmedUrl(value: string | null | undefined): boolean {
  return Boolean(value && String(value).trim())
}

/** Per-episode card overrides: CTA + badge icon from `videoUrl` / `audioUrl`. */
export function podcastCardPropsForEpisode(
  ep: PodcastEpisodePublic,
): Pick<
  ArticleCardProps,
  "metaLine" | "badgeLabel" | "ctaFeaturedText" | "ctaGridText" | "badgeMedia"
> {
  const hasVideo = hasTrimmedUrl(ep.videoUrl)
  const hasAudio = hasTrimmedUrl(ep.audioUrl)
  const badgeMedia = hasVideo ? "video" : hasAudio ? "audio" : undefined
  return {
    metaLine: "Episode",
    badgeLabel: "Episode",
    ctaFeaturedText: hasVideo ? "Watch Now" : "Listen Now",
    ctaGridText: hasVideo ? "Watch →" : "Listen →",
    badgeMedia,
  }
}
