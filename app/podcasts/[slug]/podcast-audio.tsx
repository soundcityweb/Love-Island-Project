"use client"

import { useMemo } from "react"

type EmbedResult =
  | { type: "iframe"; src: string }
  | { type: "audio"; src: string }

/**
 * Prefer hosted iframe embeds when the URL matches a known player;
 * otherwise fall back to HTML5 <audio>.
 */
function resolveAudioEmbed(url: string): EmbedResult {
  const raw = url.trim()
  const low = raw.toLowerCase()

  if (low.includes("open.spotify.com") && !low.includes("/embed/")) {
    const m = raw.match(/open\.spotify\.com\/(episode|track|show)\/([a-zA-Z0-9]+)/i)
    if (m) {
      return {
        type: "iframe",
        src: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`,
      }
    }
  }
  if (low.includes("open.spotify.com/embed/")) {
    return { type: "iframe", src: raw.split("#")[0] ?? raw }
  }

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

  if (low.includes("soundcloud.com")) {
    return {
      type: "iframe",
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23ff36a0&auto_play=false&hide_related=true&show_comments=false`,
    }
  }

  if (low.includes("podcasts.apple.com")) {
    return { type: "iframe", src: raw }
  }

  if (low.includes("embed") && (low.includes("buzzsprout") || low.includes("anchor.fm") || low.includes("simplecast"))) {
    return { type: "iframe", src: raw }
  }

  return { type: "audio", src: raw }
}

export function PodcastAudio({ src, title }: { src: string; title: string }) {
  const resolved = useMemo(() => resolveAudioEmbed(src), [src])

  const frameClass =
    "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card to-muted/40 shadow-[0_20px_50px_-20px_rgba(22,8,16,0.22)] ring-1 ring-black/[0.04]"

  if (resolved.type === "iframe") {
    return (
      <div className={`${frameClass} w-full`}>
        <iframe
          src={resolved.src}
          title={`${title} — audio player`}
          className="h-[232px] w-full sm:h-[272px] md:h-[360px]"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={`${frameClass} w-full p-5 sm:p-7`}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Listen in browser
      </p>
      <audio
        controls
        controlsList="nodownload"
        className="h-12 w-full max-w-full accent-primary sm:h-[3.25rem]"
        preload="metadata"
      >
        <source src={resolved.src} />
        Your browser does not support embedded audio.
      </audio>
    </div>
  )
}
