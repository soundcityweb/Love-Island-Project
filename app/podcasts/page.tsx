import type { Metadata } from "next"
import { ArticleCard } from "@/components/news/article-card"
import { fetchPodcastsPublished } from "@/app/lib/api-server"
import {
  podcastCardPropsForEpisode,
  podcastEpisodeToArticleSummary,
} from "@/app/lib/podcasts-public"

export const metadata: Metadata = {
  title: "Podcast | Love Island Nigeria",
  description:
    "Listen to Love Island Nigeria podcast episodes — villa recaps, drama, and behind-the-mic moments.",
  openGraph: {
    title: "Podcast | Love Island Nigeria",
    description: "Official podcast — fresh drops and full archive from the villa.",
    type: "website",
  },
}

export default async function PodcastsPage() {
  const episodes = await fetchPodcastsPublished()

  const [featuredEpisode, ...rest] = episodes
  const gridEpisodes = rest

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero (matches News “Hot Off the Press” block) ───────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-li-sunset" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;Villa Audio &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
            Hot Off<br className="hidden sm:block" /> the Mic
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
            Drama, recaps, and unfiltered villa energy — hit play and stay in the world of Love Island
            Nigeria.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              Listen Anywhere &nbsp;·&nbsp; New Drops &nbsp;·&nbsp; Full Archive
            </p>
          </div>
        </div>
      </section>

      {/* ── Filter strip (same chrome as News category pills; single active pill) ── */}
      <section
        className="border-b border-border bg-card px-4 py-4 md:px-8 lg:px-12"
        aria-label="Podcast filters"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" role="list">
            <span
              role="listitem"
              className="shrink-0 rounded-full px-4 py-2 text-sm font-bold btn-gradient text-white shadow-warm"
            >
              All Episodes
            </span>
          </div>
        </div>
      </section>

      {/* ── Listing ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24 lg:px-12" aria-label="Podcast episodes">
        <div className="mx-auto max-w-7xl">
          {episodes.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-2xl font-black text-foreground">The mic is warming up.</p>
              <p className="mt-2 text-base text-muted-foreground">
                No episodes yet — check back soon for new villa audio.
              </p>
            </div>
          ) : (
            <>
              {featuredEpisode ? (
                <ArticleCard
                  article={podcastEpisodeToArticleSummary(featuredEpisode)}
                  featured
                  priority
                  href={`/podcasts/${featuredEpisode.slug}`}
                  {...podcastCardPropsForEpisode(featuredEpisode)}
                />
              ) : null}

              {gridEpisodes.length > 0 ? (
                <div
                  className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 ${featuredEpisode ? "mt-10" : ""}`}
                >
                  {gridEpisodes.map((ep, i) => (
                    <ArticleCard
                      key={ep.id}
                      article={podcastEpisodeToArticleSummary(ep)}
                      priority={i < 3}
                      href={`/podcasts/${ep.slug}`}
                      {...podcastCardPropsForEpisode(ep)}
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
