"use client"

import { youtubeEmbedSrcFromUrl } from "@/components/video/video-embed"

export type VideoEmbedModalVideo = {
  embedUrl: string
  title: string
  description?: string | null
  tag?: string | null
}

/** Iframe src with autoplay; normalizes YouTube watch/short URLs to embed nocookie. */
export function modalIframeSrc(embedUrl: string): string {
  const trimmed = embedUrl.trim()
  const yt = youtubeEmbedSrcFromUrl(trimmed)
  const base = yt ?? trimmed
  try {
    const u = new URL(base)
    u.searchParams.set("autoplay", "1")
    if (yt) u.searchParams.set("playsinline", "1")
    return u.toString()
  } catch {
    const sep = base.includes("?") ? "&" : "?"
    return `${base}${sep}autoplay=1`
  }
}

export function VideoEmbedModal({ video, onClose }: { video: VideoEmbedModalVideo; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-black/80 p-4 pt-8 pb-12 backdrop-blur-sm sm:pt-12 sm:pb-16"
      onClick={onClose}
      role="presentation"
    >
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center py-2">
        <div
          className="relative w-full max-h-[min(90dvh,calc(100dvh-3rem))] overflow-y-auto overflow-x-hidden rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="absolute right-3 top-3 z-10 rounded-md bg-black/55 px-3 py-1.5 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-black/75 hover:text-white"
          >
            ✕ Close
          </button>
          <div className="relative aspect-video w-full shrink-0 bg-black">
            <iframe
              src={modalIframeSrc(video.embedUrl)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <div className="bg-foreground px-6 py-5">
            {video.tag && (
              <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                {video.tag}
              </span>
            )}
            <h2 className="text-lg font-bold text-primary-foreground">{video.title}</h2>
            {video.description && (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-primary-foreground/60">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
