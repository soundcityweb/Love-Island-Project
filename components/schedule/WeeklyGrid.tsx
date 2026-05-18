"use client"

import { useMemo } from "react"
import type { ScheduleSlot, WeeklyPayload } from "./types"
import { StatusBadge } from "./StatusBadge"
import {
  WEEK_KEYS,
  WEEK_LABEL,
  addDaysYmd,
  broadcastPlatformLabel,
  formatDayDate,
  formatDayMonth,
  formatTimeShort,
  platformBadgeClass,
} from "./schedule-utils"

/** Parse HH:mm or HH:mm:ss to seconds since midnight for sorting. */
function startTimeSortKey(hms: string): number {
  const parts = hms.split(":").map((p) => parseInt(p, 10))
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const s = parts[2] ?? 0
  if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(s)) return 0
  return h * 3600 + m * 60 + s
}

function sortByStartTime(slots: ScheduleSlot[]): ScheduleSlot[] {
  return [...slots].sort(
    (a, b) => startTimeSortKey(a.startTime) - startTimeSortKey(b.startTime),
  )
}

export function WeeklyGrid({ payload }: { payload: WeeklyPayload }) {
  const days = useMemo(
    () =>
      WEEK_KEYS.map((key, index) => ({
        key,
        label: WEEK_LABEL[key],
        date: addDaysYmd(payload.weekStart, index),
        slots: sortByStartTime(payload[key]),
      })),
    [payload],
  )

  const allEmpty = days.every((d) => d.slots.length === 0)

  if (allEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
        <p className="text-muted-foreground">Nothing on air this week for this filter.</p>
        <p className="mt-2 text-sm text-muted-foreground/80">Try All platforms or another week.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Week of{" "}
        <span className="font-semibold text-foreground">
          {formatDayDate(payload.weekStart)} – {formatDayDate(payload.weekEnd)}
        </span>
      </p>

      <div
        role="region"
        aria-label="Weekly schedule, Monday to Sunday"
        className="-mx-1 snap-x snap-mandatory overflow-x-auto overflow-y-visible px-1 pb-3 md:mx-0 md:grid md:grid-cols-7 md:gap-3 md:overflow-visible md:px-0 md:pb-0"
      >
        <div className="flex min-w-0 gap-3 md:contents">
          {days.map(({ key, label, date, slots }) => (
            <div
              key={key}
              className="flex w-[min(82vw,18rem)] shrink-0 snap-start flex-col rounded-2xl border border-border bg-card shadow-md md:min-h-[min(60vh,520px)] md:w-auto md:min-w-0 md:snap-align-none"
            >
              <header className="border-b border-border/60 px-3 py-3 text-center sm:px-4">
                <p className="font-display text-sm font-bold tracking-wide text-[#FF36A0]">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                  {formatDayMonth(date)}
                </p>
              </header>

              <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 sm:p-3.5 md:max-h-[min(52vh,480px)]">
                {slots.length === 0 && (
                  <li className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
                    —
                  </li>
                )}
                {slots.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-3 text-left shadow-sm"
                  >
                    <time
                      dateTime={`${s.date}T${s.startTime}`}
                      className="font-mono text-xs font-bold tabular-nums text-[#FF7A17]"
                    >
                      {formatTimeShort(s.startTime)}
                    </time>
                    <p className="mt-1 line-clamp-3 text-sm font-semibold leading-snug text-foreground">
                      {s.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${platformBadgeClass(s.platform)}`}
                      >
                        {broadcastPlatformLabel(s.platform)}
                      </span>
                      {(s.status === "live" || s.isNowPlaying) && (
                        <StatusBadge status="live" isNowPlaying compact />
                      )}
                      {s.status === "upcoming" && !s.isNowPlaying && (
                        <StatusBadge status="upcoming" isNowPlaying={false} compact />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
