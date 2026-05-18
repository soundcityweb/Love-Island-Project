"use client"

import { useState, useCallback } from "react"
import { CompetitionCard } from "./competition-card"
import type { Competition } from "./types"

// ── Re-export shared type so existing imports keep working ────────────────────
export type { Competition }

// ── Tab config ────────────────────────────────────────────────────────────────

type Tab = "live" | "upcoming" | "completed"

const TABS: { id: Tab; label: string }[] = [
  { id: "live",      label: "Live Now"  },
  { id: "upcoming",  label: "Upcoming"  },
  { id: "completed", label: "Completed" },
]

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const copy: Record<Tab, { emoji: string; title: string; body: string }> = {
    live: {
      emoji: "🏖️",
      title: "No live competitions right now",
      body: "Check back soon — new villa games drop every week.",
    },
    upcoming: {
      emoji: "⏳",
      title: "Nothing scheduled yet",
      body: "The next challenge is being cooked up in the villa. Subscribe below to be first to know.",
    },
    completed: {
      emoji: "🏆",
      title: "No completed competitions yet",
      body: "Once competitions wrap up you can view the results here.",
    },
  }
  const { emoji, title, body } = copy[tab]
  return (
    <div className="col-span-full py-20 text-center">
      <span className="text-5xl" role="img" aria-label={title}>{emoji}</span>
      <h3 className="mt-4 text-lg font-bold text-white/60">{title}</h3>
      <p className="mt-2 text-sm text-white/30">{body}</p>
    </div>
  )
}

// ── NewsletterCta ─────────────────────────────────────────────────────────────

function NewsletterCta() {
  const [email,   setEmail]   = useState("")
  const [status,  setStatus]  = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim() || status === "submitting") return
      setStatus("submitting")

      try {
        const res  = await fetch("/api/newsletter/subscribe", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: email.trim() }),
        })
        const data = await res.json().catch(() => ({})) as Record<string, unknown>

        if (res.ok) {
          setStatus("success")
          setMessage("You're in! We'll let you know when the next challenge drops.")
          setEmail("")
        } else {
          setStatus("error")
          setMessage(
            typeof data.message === "string"
              ? data.message
              : "Something went wrong. Please try again.",
          )
        }
      } catch {
        setStatus("error")
        setMessage("Network error. Please check your connection.")
      }
    },
    [email, status],
  )

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-white/35">
          ✦ &nbsp;Stay in the loop&nbsp; ✦
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Don&apos;t miss next week&apos;s challenge
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          Get early access, hints, and exclusive bonus rounds straight to your inbox — before the villa even wakes up.
        </p>

        {status === "success" ? (
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
            <CheckIcon className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-300">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === "error") setStatus("idle")
              }}
              disabled={status === "submitting"}
              className="h-12 w-full flex-1 rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 sm:min-w-0"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="h-12 w-full shrink-0 rounded-xl btn-gradient px-6 text-sm font-bold text-white shadow-warm transition-all hover:-translate-y-px hover:shadow-warm-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Subscribing…
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-red-400">{message}</p>
        )}
        <p className="mt-4 text-xs text-white/20">
          No spam. One email per challenge. Unsubscribe any time.
        </p>
      </div>
    </section>
  )
}

// ── CompetitionsPage ──────────────────────────────────────────────────────────

export function CompetitionsPage({ competitions }: { competitions: Competition[] }) {
  const live      = competitions.filter((c) => c.status === "active")
  const upcoming  = competitions.filter((c) => c.status === "upcoming")
  const completed = competitions.filter((c) => c.status === "completed")

  const defaultTab: Tab =
    live.length > 0 ? "live" : upcoming.length > 0 ? "upcoming" : "completed"

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  const tabCompetitions: Record<Tab, Competition[]> = { live, upcoming, completed }
  const counts: Record<Tab, number> = {
    live:      live.length,
    upcoming:  upcoming.length,
    completed: completed.length,
  }
  const current = tabCompetitions[activeTab]

  return (
    <section className="mx-auto max-w-7xl px-4 pb-0 pt-10 md:px-8 md:pt-14 lg:px-12">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "btn-gradient text-white shadow-warm"
                  : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              {tab.id === "live" && isActive && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              )}
              {tab.label}
              {counts[tab.id] > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-white/10 text-white/50"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {current.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          current.map((c) => <CompetitionCard key={c.id} competition={c} />)
        )}
      </div>

      {/* Newsletter footer */}
      <div className="mt-16 sm:mt-24">
        <NewsletterCta />
      </div>
    </section>
  )
}

// ── Micro icons ───────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}
