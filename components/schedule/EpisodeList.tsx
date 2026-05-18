"use client"

import Link from "next/link"
import type { EpisodeGroup, ScheduleSlot } from "./types"
import {
  broadcastPlatformLabel,
  formatTime12h,
  platformBadgeClass,
} from "./schedule-utils"

function collectSlots(g: EpisodeGroup): ScheduleSlot[] {
  return g.platforms.flatMap((p) => p.entries)
}

function episodeTitle(g: EpisodeGroup): string {
  if (g.episodeNumber != null) {
    return `Episode ${g.episodeNumber}`
  }
  const first = g.platforms[0]?.entries[0]
  return first?.title ?? "Special & extras"
}

function episodeSubtitle(g: EpisodeGroup): string | null {
  if (g.episodeNumber == null) return null
  const first = g.platforms[0]?.entries[0]?.title
  if (!first) return null
  if (first.toLowerCase().startsWith(`episode ${g.episodeNumber}`)) return null
  return first
}

function pickDescription(g: EpisodeGroup): string | null {
  for (const s of collectSlots(g)) {
    const d = s.description?.trim()
    if (d) return d
  }
  return null
}

function groupHasDigital(g: EpisodeGroup): boolean {
  return collectSlots(g).some((s) => s.platform === "digital")
}

/**
 * TV / radio-style times; digital catch-up rows use “Next Day”.
 */
function broadcastTimeLabel(slot: ScheduleSlot): string {
  if (slot.platform === "digital") {
    return "Next Day"
  }
  return formatTime12h(slot.startTime)
}

export function EpisodeList({ groups }: { groups: EpisodeGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
        <p className="text-muted-foreground">No episodes in the schedule yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((g, idx) => {
        const description = pickDescription(g)
        const subtitle = episodeSubtitle(g)
        const showWatchNow = groupHasDigital(g)

        return (
          <article
            key={`${g.episodeNumber ?? "x"}-${idx}`}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#FF7A17] via-[#FF36A0] to-[#FCFB3A]" />

            <div className="p-5 sm:p-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {episodeTitle(g)}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{subtitle}</p>
              )}

              {description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {description}
                </p>
              )}

              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Broadcasts
                </p>
                <ul className="space-y-0 divide-y divide-border/60 rounded-xl border border-border/80 bg-muted/20">
                  {g.platforms.map(({ platform, entries }) => {
                    const slot = entries[0]
                    if (!slot) return null
                    return (
                      <li
                        key={platform}
                        className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${platformBadgeClass(platform)}`}
                          >
                            {broadcastPlatformLabel(platform)}
                          </span>
                          <span className="text-muted-foreground/80" aria-hidden>
                            →
                          </span>
                        </span>
                        <span className="shrink-0 text-right font-display text-base font-bold tabular-nums text-foreground sm:text-lg">
                          {broadcastTimeLabel(slot)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {showWatchNow && (
                <div className="mt-6">
                  <Link
                    href="/videos"
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A17] to-[#FF36A0] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-orange-500/25 transition hover:opacity-95 sm:w-auto"
                  >
                    Watch Now
                  </Link>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
