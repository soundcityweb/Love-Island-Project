import type { Metadata } from "next"
import { fetchVideos } from "@/app/lib/api-server"
import { VideoGrid } from "@/components/videos/video-grid"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApiVideo {
  id: string
  slug: string
  title: string
  description: string | null
  embedUrl: string
  thumbnail: string | null
  duration: string | null
  tag: string | null
  isPublished: boolean
  displayOrder: number
  createdAt: string
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Videos & Clips | Love Island Nigeria",
  description:
    "Watch official trailers, first-look clips, diary room confessionals and exclusive behind-the-scenes content from Love Island Nigeria.",
  openGraph: {
    title: "Videos & Clips | Love Island Nigeria",
    description:
      "Watch trailers, first-look teasers, diary room confessionals and exclusive clips from the villa.",
    type: "website",
  },
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function VideosPage() {
  const videos = (await fetchVideos()) as ApiVideo[]

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero (matches News / Podcasts gradient + fixed SiteHeader overlay) ── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-li-sunset" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;Exclusive Clips &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
            Videos &<br className="hidden sm:block" /> Clips
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
            Trailers, first-look teasers, diary room confessionals and behind-the-scenes moments —
            straight from the villa.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              Trailers &nbsp;·&nbsp; First Looks &nbsp;·&nbsp; Diary Room
            </p>
          </div>
        </div>
      </section>

      <VideoGrid videos={videos} />
    </main>
  )
}
