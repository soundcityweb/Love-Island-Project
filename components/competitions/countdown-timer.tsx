"use client"

import { useState, useEffect } from "react"

// ── Helpers ───────────────────────────────────────────────────────────────────

function secondsUntil(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000))
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

interface TimeUnits {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function decompose(totalSec: number): TimeUnits {
  return {
    days:    Math.floor(totalSec / 86400),
    hours:   Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

// ── CountdownTimer ────────────────────────────────────────────────────────────

export interface CountdownTimerProps {
  /** ISO-8601 target datetime string */
  targetIso: string
  /** "ends" shows "Ends in …", "starts" shows "Starts in …" */
  label: "ends" | "starts"
  /**
   * `card`  — compact inline row, used inside competition cards
   * `hero`  — large digit blocks, used in the detail page hero section
   */
  variant?: "card" | "hero"
}

/**
 * Client-side countdown timer.
 * Renders `null` once the target time is reached.
 * Shows a placeholder skeleton while hydrating on the client.
 */
export function CountdownTimer({
  targetIso,
  label,
  variant = "card",
}: CountdownTimerProps) {
  const [secs, setSecs] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setSecs(secondsUntil(targetIso))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetIso])

  // ── Hydration placeholder ─────────────────────────────────────────────────
  if (secs === null) {
    return variant === "hero" ? (
      <div className="flex justify-center gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-16 animate-pulse rounded-xl bg-white/5 sm:h-20 sm:w-20" />
        ))}
      </div>
    ) : (
      <div className="h-5 w-36 animate-pulse rounded-lg bg-white/5" />
    )
  }

  if (secs <= 0) return null

  const { days, hours, minutes, seconds } = decompose(secs)
  const labelText = label === "ends" ? "Ends in" : "Starts in"

  // ── Hero variant ──────────────────────────────────────────────────────────
  if (variant === "hero") {
    const units = days > 0
      ? [{ v: String(days), u: "days" }, { v: pad2(hours), u: "hrs" }, { v: pad2(minutes), u: "min" }]
      : [{ v: pad2(hours), u: "hrs" }, { v: pad2(minutes), u: "min" }, { v: pad2(seconds), u: "sec" }]

    return (
      <div className="w-full">
        <p className="mb-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
          {labelText}
        </p>
        <div className="flex items-stretch justify-center gap-2 sm:gap-3">
          {units.map(({ v, u }, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex min-w-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 sm:min-w-[60px] sm:py-3">
                <span className="font-mono text-2xl font-black tabular-nums text-white sm:text-3xl">
                  {v}
                </span>
              </div>
              <span className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
                {u}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Card variant (default) ────────────────────────────────────────────────
  const units = days > 0
    ? [{ v: String(days), u: "d" }, { v: pad2(hours), u: "h" }, { v: pad2(minutes), u: "m" }]
    : [{ v: pad2(hours), u: "h" }, { v: pad2(minutes), u: "m" }, { v: pad2(seconds), u: "s" }]

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
        {labelText}
      </span>
      <div className="flex items-center gap-1">
        {units.map(({ v, u }, i) => (
          <span key={i} className="flex items-baseline gap-0.5">
            <span className="font-mono text-sm font-black tabular-nums text-primary">{v}</span>
            <span className="font-mono text-[10px] text-white/40">{u}</span>
            {i < units.length - 1 && (
              <span className="ml-0.5 font-mono text-[10px] text-white/25">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
