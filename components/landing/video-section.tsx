"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useCallback, useEffect } from "react"
import type { VideoClip, VideoSectionContent } from "@/app/types/landing"
import { youtubeEmbedSrcFromUrl } from "@/components/video/video-embed"
import { VideoEmbedModal } from "@/components/video/video-embed-modal"

export interface VideoSectionProps {
  content: VideoSectionContent
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function featuredIframeSrc(embedUrl: string): string {
  return youtubeEmbedSrcFromUrl(embedUrl) ?? embedUrl
}

function ClipCardTextMeta({ clip }: { clip: VideoClip }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4">
      <h3 className="line-clamp-2 font-bold text-primary-foreground transition-colors group-hover:text-primary">
        {clip.title}
      </h3>
      <p
        className="line-clamp-3 text-sm leading-relaxed text-primary-foreground/55"
        title={clip.description.trim() ? clip.description : undefined}
      >
        {clip.description}
      </p>
    </div>
  )
}

export function VideoSection({ content }: VideoSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeClip, setActiveClip] = useState<VideoClip | null>(null)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector("article")?.offsetWidth ?? 340
    el.scrollBy({
      left: direction === "left" ? -cardWidth - 24 : cardWidth + 24,
      behavior: "smooth",
    })
  }

  return (
    <section id="videos" className="overflow-hidden bg-foreground py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header row */}
        <div className="animate-on-scroll flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
              {content.label}
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl">
              {content.title}
            </h2>
            <p className="mt-3 max-w-lg text-pretty leading-relaxed text-primary-foreground/60">
              {content.description}
            </p>
          </div>

          {/* Carousel navigation */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll clips left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll clips right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal carousel */}
        <div
          ref={scrollRef}
          className="-mx-6 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 lg:mt-12"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Featured embed card — wider */}
          <article className="flex w-[min(100%,560px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <div className="relative aspect-video shrink-0">
              <iframe
                src={featuredIframeSrc(content.featuredVideo.embedUrl)}
                title={content.featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full rounded-t-2xl"
              />
            </div>
            <div className="flex flex-col gap-2 px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
                  FEATURED
                </span>
                <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-primary-foreground line-clamp-2">
                  {content.featuredVideo.title}
                </p>
              </div>
            </div>
          </article>

          {/* Clip cards */}
          {content.clips.map((clip, index) => {
            const playable = Boolean(clip.embedUrl)
            return (
              <article
                key={clip.slug ?? `${clip.title}-${index}`}
                className={`group w-[min(85%,340px)] shrink-0 snap-start overflow-hidden rounded-2xl bg-primary-foreground/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-primary-foreground/15 hover:shadow-warm ${
                  playable ? "cursor-pointer" : ""
                }`}
                onClick={playable ? () => setActiveClip(clip) : undefined}
                onKeyDown={
                  playable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          setActiveClip(clip)
                        }
                      }
                    : undefined
                }
                role={playable ? "button" : undefined}
                tabIndex={playable ? 0 : undefined}
                aria-label={playable ? `Play ${clip.title}` : undefined}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video shrink-0 overflow-hidden">
                  <Image
                    src={clip.image || "/placeholder.svg"}
                    alt={clip.title}
                    width={640}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-foreground/10 transition-colors duration-300 group-hover:bg-foreground/30" />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <PlayIcon className="ml-0.5 h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  {/* Tag */}
                  <span className="absolute left-3 top-3 rounded-md bg-foreground/70 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
                    {clip.tag}
                  </span>
                  {/* Duration */}
                  {clip.duration ? (
                    <span className="absolute bottom-3 right-3 rounded-md bg-foreground/70 px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground backdrop-blur-sm">
                      {clip.duration}
                    </span>
                  ) : null}
                </div>

                <ClipCardTextMeta clip={clip} />
              </article>
            )
          })}
        </div>

        {/* Bottom link */}
        <div className="mt-8 text-center">
          <Link
            href={content.ctaHref || "/videos"}
            className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
          >
            {content.ctaLabel}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      {activeClip?.embedUrl && (
        <VideoEmbedModal
          video={{
            embedUrl: activeClip.embedUrl,
            title: activeClip.title,
            description: activeClip.description,
            tag: activeClip.tag,
          }}
          onClose={() => setActiveClip(null)}
        />
      )}
    </section>
  )
}
