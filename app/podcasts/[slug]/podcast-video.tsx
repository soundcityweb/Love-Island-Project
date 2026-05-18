"use client"

import { useMemo } from "react"

type EmbedResult =
  | { type: "iframe"; src: string }
  | { type: "video"; src: string }

function resolveVideoEmbed(url: string): EmbedResult {
  const raw = url.trim()
  const low = raw.toLowerCase()

  if (low.includes("youtube.com/watch") || low.includes("youtu.be/")) {
    let id: string | undefined
    try {
      const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
      if (u.hostname === "youtu.be") {
        id = u.pathname.slice(1).split("/")[0]
      } else {
        id = u.searchParams.get("v") ?? undefined
      }
    } catch {
      const m = raw.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      id = m?.[1]
    }
    if (id) {
      return {
        type: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      }
    }
  }

  if (low.includes("youtube.com/embed/")) {
    return { type: "iframe", src: raw.split("#")[0] ?? raw }
  }

  const vimeoMatch = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeoMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  return { type: "video", src: raw }
}

export function PodcastVideoPlayer({ url, title }: { url: string; title: string }) {
  const resolved = useMemo(() => resolveVideoEmbed(url), [url])

  const frameClass =
    "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card to-muted/40 shadow-[0_20px_50px_-20px_rgba(22,8,16,0.22)] ring-1 ring-black/[0.04]"

  if (resolved.type === "iframe") {
    return (
      <div className={`${frameClass} w-full`}>
        <iframe
          src={resolved.src}
          title={`${title} — video`}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={`${frameClass} w-full p-5 sm:p-7`}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Watch in browser
      </p>
      <video
        controls
        controlsList="nodownload"
        className="aspect-video w-full max-w-full rounded-xl accent-primary"
        preload="metadata"
      >
        <source src={resolved.src} />
        Your browser does not support embedded video.
      </video>
    </div>
  )
}
