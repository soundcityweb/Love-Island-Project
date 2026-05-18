"use client"

/**
 * QuizSubmissionAdmin
 *
 * A self-contained component that fetches all quiz submissions for a given
 * competitionId, calculates scores / percentages, sorts by highest score,
 * renders a top-10 leaderboard, and lets admins drill into any submission via
 * a question-by-question review modal.
 *
 * Usage:
 *   <QuizSubmissionAdmin competitionId="uuid-here" title="Week 3 Trivia" />
 */

import { useState, useEffect, useMemo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  userAnswer: string | null
  correct: boolean
}

type SubmissionStatus = "active" | "disqualified" | "winner"

interface QuizSubmission {
  id: string
  userId: string
  competitionId: string
  competition: { id: string; title: string; slug: string } | null
  score: number
  total: number
  answers: Record<string, string>
  status: SubmissionStatus
  createdAt: string
  rank: number
  questions: QuizQuestion[]
}

interface LeaderboardEntry {
  rank: number
  userId: string
  score: number
  submittedAt: string
}

interface Stats {
  totalSubmissions: number
  avgScore: number
  topScore: number
  totalQuestions: number
  passThreshold: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pct = (score: number, total: number) =>
  total > 0 ? Math.round((score / total) * 100) : 0

const shortId = (id: string) => id.slice(0, 8).toUpperCase()

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

function scoreBadgeClass(p: number) {
  if (p >= 80) return "border-emerald-300 bg-emerald-50 text-emerald-700"
  if (p >= 50) return "border-amber-300  bg-amber-50  text-amber-700"
  return           "border-red-300    bg-red-50    text-red-700"
}

function rankBadgeClass(rank: number) {
  if (rank === 1) return "border-amber-300  bg-amber-50  text-amber-700"
  if (rank === 2) return "border-slate-300  bg-slate-50  text-slate-600"
  if (rank === 3) return "border-orange-300 bg-orange-50 text-orange-700"
  return           "border-muted bg-muted/20 text-muted-foreground"
}

const rankLabel = (r: number) =>
  r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`

// ─── Inline icons (no extra deps) ────────────────────────────────────────────

const SearchIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)
const TrophyIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
  </svg>
)
const CheckIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)
const XIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)
const EyeIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)
const ChevronIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)
const SpinnerIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${accent ?? "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function ScoreBar({ score, total }: { score: number; total: number }) {
  const p = pct(score, total)
  const bar = p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${p}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{p}%</span>
    </div>
  )
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

function Leaderboard({
  entries,
  totalQuestions,
}: {
  entries: LeaderboardEntry[]
  totalQuestions: number
}) {
  if (!entries.length) return null

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
        <TrophyIcon cls="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold text-foreground">Top 10 Leaderboard</h2>
        <span className="ml-auto text-xs text-muted-foreground">{entries.length} participants</span>
      </div>

      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const p = totalQuestions ? pct(entry.score, totalQuestions) : null
          const isTop3 = entry.rank <= 3

          return (
            <div
              key={`${entry.rank}-${entry.userId}`}
              className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/20 ${isTop3 ? "bg-amber-50/30" : ""}`}
            >
              {/* Rank */}
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                entry.rank === 1 ? "bg-amber-100 text-amber-700" :
                entry.rank === 2 ? "bg-slate-100 text-slate-600" :
                entry.rank === 3 ? "bg-orange-100 text-orange-700" :
                "bg-muted text-muted-foreground"
              }`}>
                {rankLabel(entry.rank)}
              </span>

              {/* User */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold text-foreground">
                  {shortId(entry.userId)}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {entry.userId.slice(0, 22)}…
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {entry.score}{totalQuestions ? `/${totalQuestions}` : ""}
                </p>
                {p !== null && (
                  <p className={`text-[10px] font-medium ${p >= 80 ? "text-emerald-600" : p >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {p}%
                  </p>
                )}
              </div>

              {/* Date */}
              <p className="hidden whitespace-nowrap text-[11px] text-muted-foreground lg:block">
                {fmtDate(entry.submittedAt)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Answer Review Modal ──────────────────────────────────────────────────────

function AnswerModal({
  submission,
  open,
  onClose,
}: {
  submission: QuizSubmission | null
  open: boolean
  onClose: () => void
}) {
  if (!submission) return null

  const correct = submission.questions.filter((q) => q.correct).length
  const total   = submission.questions.length
  const p       = pct(correct, total)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Answer Review
            <Badge variant="outline" className={`text-xs font-bold ${scoreBadgeClass(p)}`}>
              {correct}/{total} &nbsp;·&nbsp; {p}%
            </Badge>
            <Badge variant="outline" className={`text-xs ${rankBadgeClass(submission.rank)}`}>
              {rankLabel(submission.rank)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {submission.competition?.title ?? "Quiz"} &nbsp;·&nbsp;
            User{" "}
            <span className="font-mono">{shortId(submission.userId)}</span>
            &nbsp;·&nbsp; {fmtDate(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Progress summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-bold">{correct} / {total}</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${p}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="font-semibold">{p}% score</span>
            <span>100%</span>
          </div>
        </div>

        {/* Quick legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-300" />
            Correct answer
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-red-100 ring-1 ring-red-300" />
            Wrong choice
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-muted ring-1 ring-border" />
            Not selected
          </span>
        </div>

        <Separator />

        {/* Questions */}
        {submission.questions.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-muted-foreground">
            Question data unavailable for this submission.
          </p>
        ) : (
          <div className="space-y-5">
            {submission.questions.map((q, idx) => {
              const answered = q.userAnswer !== null
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 ${q.correct ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/30"}`}
                >
                  {/* Question row */}
                  <div className="flex items-start gap-3">
                    {/* Number + result dot */}
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${q.correct ? "bg-emerald-500" : "bg-red-500"}`}>
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold leading-snug text-foreground">
                      {q.question}
                    </p>
                    {/* Result icon */}
                    <span className={`mt-0.5 shrink-0 rounded-full p-0.5 ${q.correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {q.correct ? <CheckIcon cls="h-4 w-4" /> : <XIcon cls="h-4 w-4" />}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="mt-3 grid grid-cols-1 gap-1.5 pl-9 sm:grid-cols-2">
                    {q.options.map((opt) => {
                      const isCorrect  = opt === q.correctAnswer
                      const isSelected = opt === q.userAnswer
                      const isWrong    = isSelected && !isCorrect

                      let cls = "relative flex items-center gap-2 rounded-lg border px-3 py-2 text-xs "
                      if (isCorrect && isSelected)
                        cls += "border-emerald-400 bg-emerald-100 font-semibold text-emerald-800"
                      else if (isCorrect)
                        cls += "border-emerald-300 bg-emerald-50 font-medium text-emerald-700"
                      else if (isWrong)
                        cls += "border-red-400 bg-red-100 font-semibold text-red-800"
                      else
                        cls += "border-border bg-background text-muted-foreground"

                      return (
                        <div key={opt} className={cls}>
                          {/* Lead icon */}
                          {isCorrect && (
                            <CheckIcon cls="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          )}
                          {isWrong && (
                            <XIcon cls="h-3.5 w-3.5 shrink-0 text-red-600" />
                          )}
                          {!isCorrect && !isSelected && (
                            <span className="h-3.5 w-3.5 shrink-0" /> /* spacer */
                          )}

                          <span className="flex-1">{opt}</span>

                          {/* Tail label */}
                          {isCorrect && !isSelected && (
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">
                              Correct
                            </span>
                          )}
                          {isCorrect && isSelected && (
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">
                              ✓ Correct
                            </span>
                          )}
                          {isWrong && (
                            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">
                              User's pick
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* No answer note */}
                  {!answered && (
                    <p className="mt-2 pl-9 text-[11px] italic text-muted-foreground">
                      No answer submitted.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface QuizSubmissionAdminProps {
  /** UUID of the competition to load submissions for. */
  competitionId: string
  /** Optional display title shown in the section header. */
  title?: string
}

export function QuizSubmissionAdmin({ competitionId, title }: QuizSubmissionAdminProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats]           = useState<Stats | null>(null)

  const [search, setSearch]         = useState("")
  const [sortKey, setSortKey]       = useState<"score" | "rank" | "date">("score")
  const [statusFilter, setStatus]   = useState<"all" | SubmissionStatus>("all")

  const [selected, setSelected]     = useState<QuizSubmission | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/submissions?limit=200`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()

      const rows: QuizSubmission[] = (body.data ?? []).map((s: any): QuizSubmission => ({
        id:            s.id,
        userId:        s.userId,
        competitionId: s.competitionId,
        competition:   s.competition ?? null,
        score:         s.score   ?? 0,
        total:         s.total   ?? 0,
        answers:       s.answers ?? {},
        status:        s.status  ?? "active",
        createdAt:     s.createdAt,
        rank:          s.rank    ?? 0,
        questions:     (s.questions ?? []).map((q: any): QuizQuestion => ({
          id:            q.id,
          question:      q.question,
          options:       q.options ?? [],
          correctAnswer: q.correctAnswer ?? "",
          userAnswer:    q.userAnswer ?? null,
          correct:       Boolean(q.correct),
        })),
      }))

      // Client-side sort by score DESC (server already returns this order, but
      // recalculate after any future status-update refreshes).
      rows.sort((a, b) => b.score - a.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      setSubmissions(rows)
      setLeaderboard(body.leaderboard ?? [])
      setStats(body.stats ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load submissions.")
    } finally {
      setLoading(false)
    }
  }, [competitionId])

  useEffect(() => { load() }, [load])

  // ── Filtered + sorted rows ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = submissions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.userId.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false
      }
      return true
    })

    if (sortKey === "score")  rows = [...rows].sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
    if (sortKey === "rank")   rows = [...rows].sort((a, b) => a.rank - b.rank)
    if (sortKey === "date")   rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return rows
  }, [submissions, search, statusFilter, sortKey])

  // ── Derived stats (from filtered set) ───────────────────────────────────
  const derived = useMemo(() => {
    const total   = filtered.length
    const scored  = filtered.filter((s) => s.total > 0)
    const avgPct  = scored.length
      ? Math.round(scored.reduce((a, s) => a + pct(s.score, s.total), 0) / scored.length)
      : 0
    const top     = filtered.reduce((m, s) => Math.max(m, s.score), 0)
    const passed  = filtered.filter((s) => s.total > 0 && pct(s.score, s.total) >= 50).length
    return { total, avgPct, top, passed }
  }, [filtered])

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-label="Loading quiz submissions">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <SpinnerIcon cls="h-6 w-6 text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load submissions</p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={load}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Section header ── */}
      {title && (
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quiz submissions · sorted by highest score
          </p>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Entries"
          value={derived.total}
          sub="submissions loaded"
        />
        <StatCard
          label="Avg Score"
          value={`${derived.avgPct}%`}
          sub="across visible rows"
          accent={
            derived.avgPct >= 70 ? "text-emerald-600" :
            derived.avgPct >= 40 ? "text-amber-600" :
            "text-red-600"
          }
        />
        <StatCard
          label="Top Score"
          value={stats?.totalQuestions ? `${derived.top}/${stats.totalQuestions}` : derived.top}
          sub="highest correct answers"
          accent="text-primary"
        />
        <StatCard
          label="Pass Rate"
          value={derived.total ? `${Math.round((derived.passed / derived.total) * 100)}%` : "—"}
          sub="≥ 50% correct"
          accent={
            derived.total
              ? Math.round((derived.passed / derived.total) * 100) >= 60
                ? "text-emerald-600" : "text-amber-600"
              : undefined
          }
        />
      </div>

      {/* ── Leaderboard ── */}
      <Leaderboard entries={leaderboard} totalQuestions={stats?.totalQuestions ?? 0} />

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon cls="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="score">Sort: Highest Score</option>
            <option value="rank">Sort: Rank</option>
            <option value="date">Sort: Latest First</option>
          </select>
          <ChevronIcon cls="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as typeof statusFilter)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="winner">Winner</option>
            <option value="disqualified">Disqualified</option>
          </select>
          <ChevronIcon cls="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {(search || statusFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatus("all") }}>
            Clear
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={load} className="ml-auto">
          Refresh
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Rank</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">User</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Correct / Total</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Percentage</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide md:table-cell">Status</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide lg:table-cell">Submitted</TableHead>
              <TableHead className="w-20 text-xs font-semibold uppercase tracking-wide">View</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                  {submissions.length === 0
                    ? "No quiz submissions for this competition yet."
                    : "No submissions match the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                const p = pct(sub.score, sub.total)

                return (
                  <TableRow key={sub.id} className="group">
                    {/* Rank */}
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-bold ${rankBadgeClass(sub.rank)}`}>
                        {rankLabel(sub.rank)}
                      </Badge>
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {/* Avatar tile */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {shortId(sub.userId).slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-mono text-[11px] font-semibold text-foreground">
                            {shortId(sub.userId)}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {sub.userId.slice(0, 16)}…
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Score badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-sm font-bold tabular-nums ${scoreBadgeClass(p)}`}
                      >
                        {sub.total > 0 ? `${p}%` : `${sub.score} pts`}
                      </Badge>
                    </TableCell>

                    {/* Correct / Total */}
                    <TableCell>
                      <span className="font-mono text-sm">
                        <span className="font-bold text-emerald-600">{sub.score}</span>
                        <span className="text-muted-foreground">
                          /{sub.total > 0 ? sub.total : "?"}
                        </span>
                      </span>
                    </TableCell>

                    {/* Percentage bar */}
                    <TableCell>
                      {sub.total > 0 ? (
                        <ScoreBar score={sub.score} total={sub.total} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          sub.status === "active"       ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                          sub.status === "disqualified" ? "border-red-200 bg-red-50 text-red-700" :
                          "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="hidden lg:table-cell">
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDate(sub.createdAt)}
                      </span>
                    </TableCell>

                    {/* View button */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => { setSelected(sub); setModalOpen(true) }}
                      >
                        <EyeIcon cls="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {filtered.length > 0 && (
          <div className="border-t border-border bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{filtered.length}</span>
              {" "}of{" "}
              <span className="font-medium text-foreground">{submissions.length}</span>
              {" "}submissions — sorted by{" "}
              <span className="font-medium text-foreground">
                {sortKey === "score" ? "highest score" : sortKey === "rank" ? "rank" : "latest first"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ── Answer review modal ── */}
      <AnswerModal
        submission={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
