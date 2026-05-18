import type { Metadata } from "next"
import { VotingGridWrapper } from "@/components/voting/voting-grid-wrapper"

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type VoteSearchParams = { preview?: string; event?: string; token?: string }

function parseVoteSearchParams(sp: VoteSearchParams) {
  const previewFlag = sp.preview === "1" || sp.preview === "true"
  const eventId =
    typeof sp.event === "string" && UUID_V4_RE.test(sp.event) ? sp.event : null
  const token = typeof sp.token === "string" && sp.token.length > 0 ? sp.token : null
  const previewConfig =
    previewFlag && eventId && token ? { eventId, token } : null
  const previewLinkInvalid = previewFlag && !previewConfig
  return { previewConfig, previewLinkInvalid }
}

type Props = { searchParams: Promise<VoteSearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const { previewConfig } = parseVoteSearchParams(sp)
  if (previewConfig) {
    return {
      title: "Vote preview (draft) — Love Island Nigeria",
      description:
        "Admin preview of a draft voting event. Votes are not recorded.",
      robots: { index: false, follow: false },
    }
  }
  return {
    title: "Vote - Love Island Nigeria",
    description:
      "Vote for your favourite Love Island Nigeria islander. Keep them in the villa or send them home.",
  }
}

export default async function VotePage({ searchParams }: Props) {
  const sp = await searchParams
  const { previewConfig, previewLinkInvalid } = parseVoteSearchParams(sp)
  const showPreviewBadge = Boolean(previewConfig)

  return (
    <main className="min-w-0 overflow-x-hidden bg-foreground">
      {/* Hero — tropical sunset, same energy as islanders / news */}
      <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:pb-16 sm:pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-li-sunset" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

        <div className="relative mx-auto max-w-7xl text-center">
          {showPreviewBadge ? (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/15 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100">
                Preview Mode
              </span>
            </div>
          ) : (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
                Live Vote
              </span>
            </div>
          )}

          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;Love Island Nigeria &nbsp;·&nbsp; The Power is Yours&nbsp; ✦
          </p>

          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight text-white drop-shadow-lg sm:mt-4 sm:text-5xl md:text-6xl lg:text-8xl">
            Your Vote.
            <br className="hidden sm:block" /> Their Fate.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/85 sm:mt-5 sm:text-lg md:text-xl">
            Every tap counts. Your choice can keep someone in the villa — or
            change the game forever. This isn&apos;t just a poll; it&apos;s
            the moment millions tune in for. Make it count.
          </p>

          <div className="mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:mt-10 sm:gap-x-8 sm:gap-y-3">
            {[
              { label: "1 vote", detail: "per person" },
              { label: "Closes", detail: "10PM WAT" },
              { label: "Week 4", detail: "Eviction" },
            ].map((rule) => (
              <div key={rule.label} className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary-foreground">
                  {rule.label}
                </span>
                <span className="text-xs text-white/45">{rule.detail}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex min-w-0 items-center justify-center gap-2 sm:mt-8 sm:gap-4">
            <div className="h-px min-w-[2rem] max-w-[80px] flex-1 bg-white/25" />
            <p className="max-w-[min(100%,20rem)] text-center text-[10px] font-bold uppercase leading-snug tracking-[0.2em] text-white/50 sm:text-[11px] sm:tracking-[0.3em]">
              One tap · One islander · All the drama
            </p>
            <div className="h-px min-w-[2rem] max-w-[80px] flex-1 bg-white/25" />
          </div>
        </div>
      </section>

      {/* Voting grid — same dark surface as rest of page so primary-foreground text stays readable */}
      <section className="mx-auto max-w-7xl bg-foreground px-4 pb-16 pt-10 sm:pb-20 sm:pt-14 md:px-8 md:pt-16 lg:px-12 lg:pb-28">
        <VotingGridWrapper
          preview={previewConfig}
          previewLinkInvalid={previewLinkInvalid}
        />
      </section>

      {/* How it works */}
      <section className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <h2 className="text-center font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/40">
            How Voting Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-10">
            {[
              {
                step: "01",
                title: "Select",
                description:
                  "Choose the islander you want to save from eviction by tapping their photo.",
              },
              {
                step: "02",
                title: "Confirm",
                description:
                  "Click the Submit Vote button to lock in your choice. You get one vote per window.",
              },
              {
                step: "03",
                title: "Tune In",
                description:
                  "Watch the live eviction show to see who stays and who leaves the villa.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="font-mono text-3xl font-bold text-primary/30">
                  {item.step}
                </span>
                <h3 className="mt-2 text-lg font-bold text-primary-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/45">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
