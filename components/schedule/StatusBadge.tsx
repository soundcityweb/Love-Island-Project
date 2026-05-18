"use client"

import type { SlotStatus } from "./types"

/**
 * LIVE — red. UPCOMING — yellow (per product spec).
 */
export function StatusBadge({
  status,
  isNowPlaying,
  compact,
}: {
  status: SlotStatus
  isNowPlaying: boolean
  /** Smaller variant for weekly cells */
  compact?: boolean
}) {
  const live = status === "live" || isNowPlaying
  const base = compact ? "px-1.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"

  if (live) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-red-600 font-black uppercase tracking-wide text-white shadow-sm ring-2 ring-red-500/40 ${base}`}
      >
        {!compact && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        )}
        LIVE
      </span>
    )
  }

  if (status === "upcoming") {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-[#FCFB3A] font-black uppercase tracking-wide text-yellow-950 shadow-sm ring-1 ring-yellow-600/30 ${base}`}
      >
        UPCOMING
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-muted font-bold uppercase tracking-wide text-muted-foreground ${base}`}
    >
      Done
    </span>
  )
}
