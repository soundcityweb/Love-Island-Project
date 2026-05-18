"use client"

/**
 * PollResultsAdmin
 *
 * Self-contained analytics widget for poll (and any vote-based) competitions.
 * Fetches aggregated results from GET /api/admin/competitions/:id/results,
 * calculates per-option vote share, and renders animated progress bars.
 *
 * Usage:
 *   <PollResultsAdmin competitionId="uuid" title="Favourite Islander Poll" />
 */

import { useState, useEffect, useCallback } from "react"
import { Badge }     from "@/components/ui/badge"
import { Button }    from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PollOptionResult {
  option: string
  count:  number
  pct:    number
}

export interface PollQuestionResult {
  id:         string
  question:   string
  totalVotes: number
  winner:     PollOptionResult | null
  options:    PollOptionResult[]   // sorted descending
}

export interface PollCompetitionResult {
  id:          string
  title:       string
  slug:        string
  type:        string
  status:      string
  startAt:     string | null
  endAt:       string | null
  totalVotes:  number
  uniqueVoters: number
  avgScore:    number
  topScore:    number
  questions:   PollQuestionResult[]
}

// ─── Colour palette ────────────────────────────────────────────────────────────

const COLORS = [
  { bar: "bg-violet-500", track: "bg-violet-100", pct: "text-violet-700", border: "border-violet-200", light: "bg-violet-50"  },
  { bar: "bg-sky-500",    track: "bg-sky-100",    pct: "text-sky-700",    border: "border-sky-200",    light: "bg-sky-50"     },
  { bar: "bg-amber-500",  track: "bg-amber-100",  pct: "text-amber-700",  border: "border-amber-200",  light: "bg-amber-50"   },
  { bar: "bg-rose-500",   track: "bg-rose-100",   pct: "text-rose-700",   border: "border-rose-200",   light: "bg-rose-50"    },
  { bar: "bg-teal-500",   track: "bg-teal-100",   pct: "text-teal-700",   border: "border-teal-200",   light: "bg-teal-50"    },
  { bar: "bg-fuchsia-500",track: "bg-fuchsia-100",pct: "text-fuchsia-700",border: "border-fuchsia-200",light: "bg-fuchsia-50" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtNum  = (n: number) => n.toLocaleString("en-NG")
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"

// ─── Icons ─────────────────────────────────────────────────────────────────────

const CrownIcon   = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
  </svg>
)
const RefreshIcon  = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)
const SpinnerIcon  = ({ cls = "" }: { cls?: string }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)
const ChartIcon    = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
)

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: {
  label: string; value: string | number; accent?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm">
      <span className={`text-2xl font-black tabular-nums leading-none ${accent ?? "text-foreground"}`}>
        {value}
      </span>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

// ─── Option progress bar ───────────────────────────────────────────────────────

function OptionBar({
  opt,
  colorIdx,
  isWinner,
  totalVotes,
  animated,
}: {
  opt:        PollOptionResult
  colorIdx:   number
  isWinner:   boolean
  totalVotes: number
  animated:   boolean
}) {
  const col = isWinner
    ? { bar: "bg-emerald-500", track: "bg-emerald-100", pct: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-50/70" }
    : COLORS[colorIdx % COLORS.length]

  // precise pct — avoid rounding quirks in display
  const precise = totalVotes > 0 ? ((opt.count / totalVotes) * 100).toFixed(1) : "0.0"

  return (
    <div className={`rounded-xl border px-4 py-3.5 transition-all ${
      isWinner ? `${col.border} ${col.light}` : "border-border bg-background"
    }`}>
      {/* ── Label row ── */}
      <div className="flex items-center gap-2.5">
        {/* Rank indicator */}
        {isWinner ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CrownIcon cls="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${col.bar}`} />
        )}

        {/* Option label */}
        <span className={`flex-1 truncate text-sm font-semibold ${
          isWinner ? "text-emerald-800" : "text-foreground"
        }`}>
          {opt.option}
        </span>

        {isWinner && (
          <Badge variant="outline" className={`shrink-0 border-emerald-300 bg-emerald-50 text-[9px] font-bold text-emerald-700`}>
            Leading
          </Badge>
        )}

        {/* Vote count */}
        <span className="shrink-0 text-xs text-muted-foreground">
          {fmtNum(opt.count)} vote{opt.count !== 1 ? "s" : ""}
        </span>

        {/* Percentage — large + prominent */}
        <span className={`w-14 shrink-0 text-right text-lg font-black tabular-nums leading-none ${
          isWinner ? col.pct : "text-foreground"
        }`}>
          {opt.pct}%
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className={`mt-2.5 h-3 overflow-hidden rounded-full ${col.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${col.bar}`}
          style={{ width: animated ? `${Math.max(opt.pct, 0.4)}%` : "0%" }}
        />
      </div>

      {/* ── Exact fraction ── */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {fmtNum(opt.count)} / {fmtNum(totalVotes)}
        </span>
        <span className="text-[10px] text-muted-foreground">{precise}%</span>
      </div>
    </div>
  )
}

// ─── Question results card ─────────────────────────────────────────────────────

function QuestionCard({ q, idx }: { q: PollQuestionResult; idx: number }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80 + idx * 120)
    return () => clearTimeout(t)
  }, [idx])

  const isTie =
    q.options.length > 1 && q.options[0].count > 0 && q.options[0].count === q.options[1].count

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Card header */}
      <div className="border-b border-border bg-muted/20 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* Question + meta */}
          <div className="flex items-start gap-2 min-w-0">
            <ChartIcon cls="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug text-foreground">{q.question}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {q.options.length} option{q.options.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                {fmtNum(q.totalVotes)} vote{q.totalVotes !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Winner callout */}
          {q.winner && !isTie && (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 shrink-0">
              <CrownIcon cls="h-3.5 w-3.5 text-emerald-500" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">Leading</p>
                <p className="text-xs font-bold text-emerald-800 leading-tight">{q.winner.option}</p>
              </div>
              <span className="ml-1 text-xl font-black tabular-nums text-emerald-700">{q.winner.pct}%</span>
            </div>
          )}

          {isTie && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] shrink-0">
              ⚖ Tied
            </Badge>
          )}
        </div>
      </div>

      {/* Option bars */}
      <div className="px-5 py-4">
        {q.totalVotes === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 py-10 text-center">
            <p className="text-xs italic text-muted-foreground">No votes recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <OptionBar
                key={opt.option}
                opt={opt}
                colorIdx={i}
                isWinner={!isTie && opt.option === q.winner?.option}
                totalVotes={q.totalVotes}
                animated={animated}
              />
            ))}
          </div>
        )}

        {/* Visual percentage scale */}
        {q.totalVotes > 0 && (
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-[9px] text-muted-foreground/60">0%</span>
            {[25, 50, 75].map((v) => (
              <span key={v} className="text-[9px] text-muted-foreground/40">{v}%</span>
            ))}
            <span className="text-[9px] text-muted-foreground/60">100%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export interface PollResultsAdminProps {
  competitionId: string
  title?:        string
}

export function PollResultsAdmin({ competitionId, title }: PollResultsAdminProps) {
  const [data,    setData]    = useState<PollCompetitionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/competitions/${competitionId}/results`)
      if (!res.ok) {
        const msg = await res.json().catch(() => ({})) as { message?: string }
        throw new Error(msg.message ?? `HTTP ${res.status}`)
      }
      const body: PollCompetitionResult = await res.json()
      setData(body)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load results.")
    } finally {
      setLoading(false)
    }
  }, [competitionId])

  useEffect(() => { load() }, [load])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-label="Loading poll results">
        {/* Stat row skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-border bg-card" />
          ))}
        </div>
        {/* Card skeletons */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-14 border-b border-border bg-muted/30" />
            <div className="space-y-2.5 p-5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-16 rounded-xl border border-border bg-muted/20" />
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-center pt-4">
          <SpinnerIcon cls="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">
          {error ?? "No result data available."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={load}>Retry</Button>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    active:    "border-emerald-200 bg-emerald-50 text-emerald-700",
    upcoming:  "border-sky-200 bg-sky-50 text-sky-700",
    completed: "border-slate-200 bg-slate-50 text-slate-600",
    draft:     "border-amber-200 bg-amber-50 text-amber-700",
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {title && (
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] capitalize ${statusColors[data.status] ?? "border-border bg-muted text-muted-foreground"}`}
            >
              {data.status}
            </Badge>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-[10px] capitalize text-primary">
              {data.type}
            </Badge>
            {(data.startAt || data.endAt) && (
              <span className="text-xs text-muted-foreground">
                {fmtDate(data.startAt)} → {fmtDate(data.endAt)}
              </span>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={load}>
          <RefreshIcon cls="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Votes"   value={fmtNum(data.totalVotes)} />
        <StatCard
          label="Unique Voters"
          value={fmtNum(data.uniqueVoters)}
          accent={data.uniqueVoters > 0 ? "text-primary" : undefined}
        />
        <StatCard
          label="Questions"
          value={data.questions.length}
          accent="text-muted-foreground"
        />
      </div>

      {/* Empty state */}
      {data.totalVotes === 0 && (
        <div className="rounded-xl border border-border bg-muted/20 py-12 text-center">
          <ChartIcon cls="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No votes recorded yet.</p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            Results will appear here once participants start voting.
          </p>
        </div>
      )}

      {/* ── Question cards ── */}
      {data.questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} idx={i} />
      ))}

      {/* ── Vote total footer ── */}
      {data.totalVotes > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Total votes cast</span>
            </div>
            <span className="text-xl font-black tabular-nums text-foreground">
              {fmtNum(data.totalVotes)}
            </span>
          </div>

          {/* Turnout bar — unique voters vs total votes */}
          {data.uniqueVoters > 0 && (
            <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Voter Engagement
                </p>
                <span className="text-xs font-bold text-foreground">
                  {fmtNum(data.uniqueVoters)} unique voter{data.uniqueVoters !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((data.uniqueVoters / Math.max(data.totalVotes, 1)) * 100),
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {fmtNum(data.uniqueVoters)} unique / {fmtNum(data.totalVotes)} total submissions
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
