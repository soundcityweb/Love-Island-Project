"use client"

import { useEffect, useState } from "react"
import type { CountdownContent } from "@/app/types/landing"

export interface CountdownSectionProps {
  content: CountdownContent
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: string
  hours: string
  minutes: string
  seconds: string
  expired: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0")
}

function computeTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", expired: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    expired: false,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/10 shadow-warm sm:h-28 sm:w-28">
        <span className="font-mono text-3xl font-bold text-primary sm:text-5xl">{value}</span>
      </div>
      <span className="mt-3 text-xs font-medium uppercase tracking-wider text-primary-foreground/50">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="mb-6 text-2xl font-bold text-primary/40 sm:text-3xl" aria-hidden>
      :
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CountdownSection({ content }: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!content.targetDate) return

    // Set initial value immediately (avoids one-second blank flash)
    setTimeLeft(computeTimeLeft(content.targetDate))

    const id = setInterval(() => {
      const next = computeTimeLeft(content.targetDate!)
      setTimeLeft(next)
      if (next.expired) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [content.targetDate])

  // Build the display units:
  //  - live timer when targetDate is provided and the timer has ticked at least once
  //  - static fallback from DB timeUnits otherwise
  const units: Array<{ label: string; value: string }> = timeLeft
    ? [
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
      ]
    : content.timeUnits

  const isLive = !!content.targetDate

  return (
    <section id="countdown" className="bg-foreground py-16 lg:py-20">
      <div className="mx-auto max-w-4xl animate-on-scroll px-6 text-center lg:px-8">
        <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
          {content.label}
        </p>
        <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
          {timeLeft?.expired ? "We Are LIVE!" : content.title}
        </h2>

        {timeLeft?.expired ? (
          <p className="mt-6 text-lg font-semibold text-primary">
            Love Island Nigeria is ON. Drop everything and watch it now.
          </p>
        ) : (
          <div
            className="mt-10 flex items-center justify-center gap-3 sm:gap-6"
            aria-label="Countdown timer"
            aria-live={isLive ? "polite" : undefined}
          >
            {units.map((unit, index) => (
              <div key={unit.label} className="flex items-center gap-3 sm:gap-6">
                <CountdownUnit value={unit.value} label={unit.label} />
                {index < units.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-sm text-primary-foreground/40">{content.footerText}</p>
      </div>
    </section>
  )
}
