import type { Metadata } from "next"
import { CompetitionsPage, type Competition } from "@/components/competitions/competitions-page"

export const metadata: Metadata = {
  title: "Competitions — Love Island Nigeria",
  description:
    "Weekly quizzes, fan polls, predictions, and upload challenges. Play the villa games and win exclusive prizes from Love Island Nigeria.",
  openGraph: {
    title: "Play the Villa Games | Love Island Nigeria",
    description:
      "Weekly challenges, quizzes, and exclusive fan competitions. Who's got villa knowledge?",
  },
}

// ── Data fetching ─────────────────────────────────────────────────────────────

const API_BASE =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function fetchPublicCompetitions(): Promise<Competition[]> {
  try {
    const res = await fetch(`${API_BASE}/api/competitions`, {
      cache: "no-store",
    })
    if (!res.ok) return []

    const data = await res.json()
    // API returns a paginated envelope { data: [], meta: {} } — unwrap it.
    // Fall back to treating the response as a plain array for safety.
    const items: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : []

    return items
      .filter((c: any) => c.status !== "draft")
      .map(
        (c: any): Competition => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          type: c.type,
          description: c.description ?? null,
          bannerUrl: c.bannerUrl ?? c.banner_url ?? null,
          sponsorName: c.sponsorName ?? c.sponsor_name ?? null,
          sponsorLogo: c.sponsorLogo ?? c.sponsor_logo ?? null,
          startAt: c.startAt ?? c.start_at ?? null,
          endAt: c.endAt ?? c.end_at ?? null,
          status: c.status,
          participantCount: c.participantCount ?? c.participant_count ?? 0,
        }),
      )
  } catch {
    return []
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompetitionsListPage() {
  const competitions = await fetchPublicCompetitions()

  const liveCount     = competitions.filter((c) => c.status === "active").length
  const upcomingCount = competitions.filter((c) => c.status === "upcoming").length

  return (
    <main className="min-h-screen bg-foreground">
      {/* ── Hero — same structure as News / Podcasts / Islanders ─────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        {/* Standard site sunset backdrop */}
        <div className="absolute inset-0 bg-li-sunset" />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;Fan Competitions &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
            Play the<br className="hidden sm:block" /> Villa Games
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
            Weekly challenges, quizzes, and exclusive fan competitions. Prove
            you know the villa inside out — and win big.
          </p>

          {/* Stat divider — matches islanders / podcasts pattern */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              {liveCount > 0 ? `${liveCount} Live Now` : upcomingCount > 0 ? `${upcomingCount} Upcoming` : "Challenges"}&nbsp;·&nbsp;Weekly Drops&nbsp;·&nbsp;Win Prizes
            </p>
          </div>
        </div>
      </section>

      {/* ── Competitions grid ─────────────────────────────────────────────── */}
      <CompetitionsPage competitions={competitions} />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24 lg:px-12">
          <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-white/25">
            How It Works
          </p>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12">
            {[
              {
                step: "01",
                title: "Pick a challenge",
                body: "Browse live and upcoming competitions. From trivia to fan polls — there's a game for every type of fan.",
              },
              {
                step: "02",
                title: "Play & submit",
                body: "Answer questions, cast your votes, or upload your entry. Each challenge has its own rules and timer.",
              },
              {
                step: "03",
                title: "Win prizes",
                body: "Top scores and selected entries win exclusive merch, vouchers, and shout-outs on the official show.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="font-mono text-4xl font-black text-primary/20">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-white/80">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/35">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
