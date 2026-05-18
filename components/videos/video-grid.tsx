"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import type { ApiVideo } from "@/app/videos/page"
import { VideoEmbedModal } from "@/components/video/video-embed-modal"

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

// ── Video card ────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  featured,
  onPlay,
}: {
  video: ApiVideo
  featured?: boolean
  onPlay: (v: ApiVideo) => void
}) {
  return (
    <article
      className={`group cursor-pointer overflow-hidden rounded-2xl bg-foreground transition-shadow hover:shadow-xl ${
        featured ? "col-span-full md:col-span-2" : ""
      }`}
      onClick={() => onPlay(video)}
      tabIndex={0}
      role="button"
      aria-label={`Play ${video.title}`}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPlay(video)}
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden ${featured ? "aspect-video" : "aspect-video"}`}>
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width:768px) 100vw, 60vw" : "(max-width:768px) 100vw, 33vw"}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-foreground" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/40" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`flex items-center justify-center rounded-full bg-primary shadow-lg transition-transform duration-300 group-hover:scale-110 ${
              featured ? "h-16 w-16" : "h-12 w-12"
            }`}
          >
            <PlayIcon className={`ml-0.5 text-primary-foreground ${featured ? "h-7 w-7" : "h-5 w-5"}`} />
          </div>
        </div>

        {/* Tag badge */}
        {video.tag && (
          <span className="absolute left-3 top-3 rounded-md bg-foreground/70 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
            {video.tag}
          </span>
        )}

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-foreground/70 px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground backdrop-blur-sm">
            {video.duration}
          </span>
        )}

        {/* Featured label */}
        {featured && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
            FEATURED
          </span>
        )}
      </div>

      {/* Info */}
      <div className={`px-5 py-4 ${featured ? "lg:px-6 lg:py-5" : ""}`}>
        <h3
          className={`font-bold text-primary-foreground transition-colors group-hover:text-primary ${
            featured ? "text-lg lg:text-xl" : "text-base"
          }`}
        >
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-primary-foreground/55">
            {video.description}
          </p>
        )}
      </div>
    </article>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ activeTag }: { activeTag: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <PlayIcon className="h-7 w-7 text-primary" />
      </div>
      <p className="text-base font-semibold text-foreground">
        {activeTag === "All" ? "No videos available yet" : `No "${activeTag}" videos yet`}
      </p>
      <p className="text-sm text-muted-foreground">Check back soon for new clips from the villa.</p>
    </div>
  )
}

// ── VideoGrid ─────────────────────────────────────────────────────────────────

export function VideoGrid({ videos }: { videos: ApiVideo[] }) {
  const [activeTag, setActiveTag] = useState("All")
  const [activeVideo, setActiveVideo] = useState<ApiVideo | null>(null)

  // Collect unique tags in display order
  const tags = useMemo(() => {
    const seen = new Set<string>()
    const list: string[] = ["All"]
    for (const v of videos) {
      if (v.tag && !seen.has(v.tag)) {
        seen.add(v.tag)
        list.push(v.tag)
      }
    }
    return list
  }, [videos])

  const filtered = useMemo(
    () => (activeTag === "All" ? videos : videos.filter((v) => v.tag === activeTag)),
    [videos, activeTag],
  )

  const [featured, ...rest] = filtered

  return (
    <>
      {/* Tag filter strip */}
      <section
        className="border-b border-border bg-card px-4 md:px-8 py-4 lg:px-12"
        aria-label="Filter by content type"
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            role="list"
            aria-label="Tag filters"
          >
            {tags.map((tag) => {
              const isActive = tag === activeTag
              return (
                <button
                  key={tag}
                  role="listitem"
                  onClick={() => setActiveTag(tag)}
                  aria-current={isActive ? "true" : undefined}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-background px-4 md:px-8 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {filtered.length === 0 ? (
            <div className="grid">
              <EmptyState activeTag={activeTag} />
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Featured card spans 2 columns on md+ */}
              {featured && (
                <VideoCard
                  video={featured}
                  featured
                  onPlay={setActiveVideo}
                />
              )}
              {rest.map((video) => (
                <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
              ))}
            </div>
          )}

          {/* Count */}
          {filtered.length > 0 && (
            <p className="mt-8 text-center text-xs text-muted-foreground">
              {filtered.length} clip{filtered.length !== 1 ? "s" : ""}
              {activeTag !== "All" ? ` tagged "${activeTag}"` : " total"}
            </p>
          )}
        </div>
      </section>

      {/* Embed modal */}
      {activeVideo && (
        <VideoEmbedModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </>
  )
}
