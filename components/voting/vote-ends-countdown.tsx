"use client"

import { useEffect, useState, useRef, useCallback } from "react"

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, "0")
}

function formatHms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const hh = hours >= 100 ? String(hours) : pad2(hours)
  return `${hh}:${pad2(minutes)}:${pad2(seconds)}`
}

export interface VoteEndsCountdownProps {
  endsAtIso: string
  offsetMs: number
  onExpired: () => void
  /** Hide timer (e.g. preview mode) */
  hidden?: boolean
}

export function VoteEndsCountdown({
  endsAtIso,
  offsetMs,
  onExpired,
  hidden = false,
}: VoteEndsCountdownProps) {
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number | null>(null)
  const fired = useRef(false)

  const stableExpire = useCallback(() => {
    if (fired.current) return
    fired.current = true
    onExpired()
  }, [onExpired])

  useEffect(() => {
    if (hidden) return
    fired.current = false
    const endsMs = new Date(endsAtIso).getTime()

    const tick = () => {
      const now = Date.now() + offsetMs
      const sec = Math.max(0, Math.floor((endsMs - now) / 1000))
      setTotalSecondsLeft(sec)
      if (sec <= 0) stableExpire()
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [endsAtIso, offsetMs, hidden, stableExpire])

  if (hidden || totalSecondsLeft === null || totalSecondsLeft <= 0) {
    return null
  }

  const display = formatHms(totalSecondsLeft)

  return (
    <div
      className="mb-6 w-full min-w-0 max-w-xl mx-auto rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 px-3 py-4 shadow-warm sm:mb-10 sm:px-8 sm:py-8"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Voting ends in ${display}`}
    >
      <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary-foreground/55">
        Voting ends in
      </p>
      <p className="mt-2 text-center font-mono text-3xl font-black tabular-nums tracking-[0.06em] text-primary-foreground sm:mt-3 sm:text-4xl sm:tracking-[0.08em] md:text-5xl">
        {display}
      </p>
      <p className="mt-2 text-center text-xs text-primary-foreground/40">
        Time synced with the server
      </p>
    </div>
  )
}
