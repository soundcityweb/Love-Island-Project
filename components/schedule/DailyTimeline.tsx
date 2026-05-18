"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { ScheduleSlot } from "./types"
import { StatusBadge } from "./StatusBadge"
import {
  formatDayDate,
  formatTimeShort,
  platformBadgeClass,
  platformLabel,
  typeLabel,
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

function sortByDateThenTime(slots: ScheduleSlot[]): ScheduleSlot[] {
  return [...slots].sort((a, b) => {
    const dc = a.date.localeCompare(b.date)
    if (dc !== 0) return dc
    return startTimeSortKey(a.startTime) - startTimeSortKey(b.startTime)
  })
}

/** Left column width — fixed for alignment (time + optional end). */
const TIME_COL = "w-[5.5rem] shrink-0 sm:w-24"

export function DailyTimeline({
  items,
  date,
  listMode = "day",
}: {
  items: ScheduleSlot[]
  date: string | null
  listMode?: "day" | "all"
}) {
  const sorted = useMemo(
    () =>
      listMode === "all" ? sortByDateThenTime(items) : sortByStartTime(items),
    [items, listMode],
  )

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
        <p className="text-muted-foreground">
          {listMode === "all" || !date
            ? "No published slots in the schedule yet."
            : `No shows scheduled for ${formatDayDate(date)}.`}
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80">
          {listMode === "all" || !date
            ? "Try another platform filter or check back later."
            : "Pick another date or switch platform filter."}
        </p>
      </div>
    )
  }

  const heading =
    listMode === "all" || !date
      ? "Full schedule"
      : formatDayDate(date)

  return (
    <div>
      <p className="mb-6 text-sm font-medium text-muted-foreground">
        <span className="font-display text-lg font-bold text-foreground">{heading}</span>
        <span className="mx-2 text-border">·</span>
        {sorted.length} showing{sorted.length !== 1 ? "s" : ""}
        {listMode === "all" && (
          <span className="mt-1 block text-xs font-normal text-muted-foreground/90 sm:mt-0 sm:ml-2 sm:inline">
            Scroll to load more.
          </span>
        )}
      </p>

      <div className="relative">
        {/* Vertical connector — aligned to center of fixed time column */}
        <div
          className="absolute top-3 bottom-3 hidden w-px bg-gradient-to-b from-[#FF7A17]/50 via-[#FF36A0]/40 to-[#FCFB3A]/50 sm:left-[calc(6rem+0.625rem)] sm:block"
          aria-hidden
        />

        <ul className="space-y-5">
          {sorted.map((slot) => (
            <li key={slot.id} className="flex gap-3 sm:gap-5">
              {/* Left: time — fixed width */}
              <div className={`${TIME_COL} flex flex-col items-end pt-1 text-right`}>
                <time
                  dateTime={slot.startTime}
                  className="font-mono text-base font-bold tabular-nums text-[#FF36A0] sm:text-lg"
                >
                  {formatTimeShort(slot.startTime)}
                </time>
                {slot.endTime && (
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                    –{formatTimeShort(slot.endTime)}
                  </span>
                )}
              </div>

              {/* Right: card */}
              <div className="relative min-w-0 flex-1">
                {slot.isNowPlaying && (
                  <>
                    <span
                      className="pointer-events-none absolute -inset-[2px] z-0 rounded-2xl bg-gradient-to-r from-red-500/50 via-rose-400/45 to-red-500/50 opacity-75 blur-[6px] animate-pulse"
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute -inset-px z-0 rounded-2xl border-2 border-red-500/70 shadow-[0_0_24px_rgba(239,68,68,0.45),0_0_48px_rgba(239,68,68,0.2)] animate-pulse"
                      aria-hidden
                    />
                  </>
                )}
                <article
                  className={cn(
                    "group relative z-10 overflow-hidden rounded-2xl border bg-card p-4 shadow-md transition-shadow sm:p-5",
                    slot.isNowPlaying
                      ? "border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                      : "border-border hover:shadow-lg",
                  )}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#FF7A17]/15 via-[#FF36A0]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <h3 className="font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
                    {slot.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {listMode === "all" && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-foreground ring-1 ring-border/80">
                        {formatDayDate(slot.date)}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
                        platformBadgeClass(slot.platform),
                      )}
                    >
                      {platformLabel(slot.platform)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/80">
                      {typeLabel(slot.contentType)}
                    </span>
                    <StatusBadge status={slot.status} isNowPlaying={slot.isNowPlaying} />
                  </div>
                </article>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
