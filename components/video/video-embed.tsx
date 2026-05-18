/**
 * Resolves a YouTube watch, short, or embed URL to a nocookie embed `src`, or `null` if unsupported.
 */
export function youtubeEmbedSrcFromUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase()

  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0]
    if (id) {
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0`
    }
    return null
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.slice("/embed/".length).split("/")[0]?.split("?")[0]
      if (id) {
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0`
      }
    }

    const shorts = url.pathname.match(/^\/shorts\/([^/?]+)/)
    if (shorts?.[1]) {
      return `https://www.youtube-nocookie.com/embed/${shorts[1]}?rel=0`
    }

    const v = url.searchParams.get("v")
    if (v) {
      return `https://www.youtube-nocookie.com/embed/${v}?rel=0`
    }
  }

  return null
}

type VideoEmbedProps = {
  videoUrl: string
}

export function VideoEmbed({ videoUrl }: VideoEmbedProps) {
  const embedSrc = youtubeEmbedSrcFromUrl(videoUrl)

  if (!embedSrc) {
    return (
      <div
        role="alert"
        className="w-full rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-6 text-center sm:px-6"
      >
        <p className="text-sm font-medium text-destructive">
          This video link isn&apos;t valid or isn&apos;t a supported YouTube URL.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Check the address and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-sm ring-1 ring-black/[0.04]">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedSrc}
          title="YouTube video player"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  )
}
