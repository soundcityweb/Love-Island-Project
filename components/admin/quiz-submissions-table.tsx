"use client"

import { useState, useMemo, useEffect, useCallback, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { CompetitionOption } from "@/types/admin-competition"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  userAnswer: string | null
  correct: boolean
}

export type SubmissionStatus = "active" | "disqualified" | "winner"

export interface QuizSubmission {
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

export interface QuizStats {
  totalSubmissions: number
  avgScore: number
  topScore: number
  totalQuestions: number
  passThreshold: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  score: number
  submittedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortId(id: string) { return id.slice(0, 8).toUpperCase() }

function pct(score: number, total: number) {
  if (!total) return 0
  return Math.round((score / total) * 100)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function scoreBadgeClass(score: number, total: number): string {
  const p = pct(score, total)
  if (!total)    return "border-muted bg-muted/30 text-muted-foreground"
  if (p >= 80)   return "border-emerald-300 bg-emerald-50 text-emerald-700"
  if (p >= 50)   return "border-amber-300 bg-amber-50 text-amber-700"
  return "border-red-300 bg-red-50 text-red-700"
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "border-amber-300 bg-amber-50 text-amber-700"
  if (rank === 2) return "border-slate-300 bg-slate-50 text-slate-600"
  if (rank === 3) return "border-orange-300 bg-orange-50 text-orange-700"
  return "border-muted bg-muted/20 text-muted-foreground"
}

function rankEmoji(rank: number) {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return `#${rank}`
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}
function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  )
}
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  )
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}
function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
function BanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  )
}
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string | number; sub?: string; accent?: string; icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground/40">{icon}</span>}
      </div>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, total }: { score: number; total: number }) {
  const p = pct(score, total)
  const color = p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${p}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{p}%</span>
    </div>
  )
}

// ─── Leaderboard Panel ────────────────────────────────────────────────────────

function LeaderboardPanel({
  entries,
  totalQuestions,
}: {
  entries: LeaderboardEntry[]
  totalQuestions: number
}) {
  if (!entries.length) return null

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
        <TrophyIcon className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold text-foreground">Top 10 Leaderboard</h2>
        <span className="ml-auto text-xs text-muted-foreground">{entries.length} entries</span>
      </div>

      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const p = totalQuestions ? pct(entry.score, totalQuestions) : null
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 px-5 py-3 ${entry.rank <= 3 ? "" : ""}`}
            >
              {/* Rank badge */}
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                entry.rank === 1 ? "bg-amber-100 text-amber-700" :
                entry.rank === 2 ? "bg-slate-100 text-slate-600" :
                entry.rank === 3 ? "bg-orange-100 text-orange-700" :
                "bg-muted text-muted-foreground"
              }`}>
                {entry.rank <= 3 ? rankEmoji(entry.rank) : `#${entry.rank}`}
              </span>

              {/* User */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-medium text-foreground truncate">
                  {shortId(entry.userId)}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">{entry.userId.slice(0, 20)}…</p>
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
              <p className="hidden text-[11px] text-muted-foreground lg:block whitespace-nowrap">
                {formatDate(entry.submittedAt)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Question Review Modal ────────────────────────────────────────────────────

function QuestionReviewModal({
  submission,
  open,
  onClose,
}: {
  submission: QuizSubmission | null
  open: boolean
  onClose: () => void
}) {
  if (!submission) return null

  const correctCount = submission.questions.filter((q) => q.correct).length
  const total        = submission.questions.length
  const percentage   = pct(correctCount, total)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Quiz Review</span>
            <Badge variant="outline" className={`ml-2 text-xs ${scoreBadgeClass(correctCount, total)}`}>
              {correctCount}/{total} correct · {percentage}%
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {submission.competition?.title ?? "Quiz"} &nbsp;·&nbsp;
            User <span className="font-mono">{shortId(submission.userId)}</span> &nbsp;·&nbsp;
            {formatDate(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Score summary bar */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-bold text-foreground">{correctCount} / {total}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0</span>
            <span className="font-medium">{percentage}%</span>
            <span>{total}</span>
          </div>
        </div>

        <Separator />

        {/* Questions */}
        <div className="space-y-4">
          {submission.questions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground italic">
              Question data is not available for this submission.
            </p>
          ) : (
            submission.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${q.correct ? "border-emerald-200" : "border-red-200"}`}
              >
                {/* Question header */}
                <div className="flex items-start gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${q.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground leading-snug">{q.question}</p>
                  <span className={`ml-auto shrink-0 rounded-full p-0.5 ${q.correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    {q.correct
                      ? <CheckIcon className="h-4 w-4" />
                      : <XMarkIcon className="h-4 w-4" />
                    }
                  </span>
                </div>

                {/* Options grid */}
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {q.options.map((opt) => {
                    const isCorrect  = opt === q.correctAnswer
                    const isSelected = opt === q.userAnswer
                    const isWrong    = isSelected && !isCorrect

                    let cls = "rounded-lg border px-3 py-2 text-xs "
                    if (isCorrect && isSelected) cls += "border-emerald-400 bg-emerald-100 text-emerald-800 font-semibold"
                    else if (isCorrect)           cls += "border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                    else if (isWrong)             cls += "border-red-400 bg-red-100 text-red-800 font-semibold"
                    else                          cls += "border-border bg-background text-muted-foreground"

                    return (
                      <div key={opt} className={cls}>
                        <span className="flex items-center gap-1.5">
                          {isCorrect && <CheckIcon className="h-3 w-3 shrink-0 text-emerald-600" />}
                          {isWrong   && <XMarkIcon className="h-3 w-3 shrink-0 text-red-600" />}
                          {opt}
                          {isSelected && !isCorrect && (
                            <span className="ml-auto text-[9px] text-red-500 font-bold">User's answer</span>
                          )}
                          {isCorrect && isSelected && (
                            <span className="ml-auto text-[9px] text-emerald-600 font-bold">Correct ✓</span>
                          )}
                          {isCorrect && !isSelected && (
                            <span className="ml-auto text-[9px] text-emerald-600">Correct answer</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Unanswered note */}
                {!q.userAnswer && (
                  <p className="mt-2 text-[11px] text-muted-foreground italic">No answer recorded.</p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuizSubmissionsTable({
  initialSubmissions,
  initialStats,
  initialLeaderboard,
  competitions,
  defaultCompetitionId,
}: {
  initialSubmissions: QuizSubmission[]
  initialStats: QuizStats
  initialLeaderboard: LeaderboardEntry[]
  competitions: CompetitionOption[]
  defaultCompetitionId?: string
}) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [stats]                       = useState(initialStats)
  const [leaderboard]                 = useState(initialLeaderboard)

  const [search, setSearch]                 = useState("")
  const [filterComp, setFilterComp]         = useState(defaultCompetitionId ?? "all")
  const [filterStatus, setFilterStatus]     = useState("all")
  const [detailSub, setDetailSub]           = useState<QuizSubmission | null>(null)
  const [detailOpen, setDetailOpen]         = useState(false)
  const [updatingIds, setUpdatingIds]       = useState<Set<string>>(new Set())
  const [errorIds, setErrorIds]             = useState<Set<string>>(new Set())

  // Sync competition filter → URL param for server-side refetch
  const handleCompFilter = useCallback((val: string) => {
    setFilterComp(val)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (val === "all") params.delete("competition")
      else params.set("competition", val)
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [router, pathname, searchParams])

  // Client-side quick filters
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filterStatus !== "all" && s.status !== filterStatus) return false
      if (filterComp   !== "all" && s.competitionId !== filterComp) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.userId.toLowerCase().includes(q) &&
            !(s.competition?.title.toLowerCase().includes(q) ?? false) &&
            !s.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [submissions, search, filterStatus, filterComp])

  // Update submission status
  const updateStatus = useCallback(async (id: string, status: SubmissionStatus) => {
    if (updatingIds.has(id)) return
    const prev = submissions.find((s) => s.id === id)
    if (!prev) return
    setSubmissions((p) => p.map((s) => s.id === id ? { ...s, status } : s))
    setUpdatingIds((p) => new Set(p).add(id))
    setErrorIds((p) => { const n = new Set(p); n.delete(id); return n })
    try {
      const res = await fetch(`/api/admin/competitions/submissions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        setSubmissions((p) => p.map((s) => s.id === id ? { ...s, status: prev.status } : s))
        setErrorIds((p) => new Set(p).add(id))
      } else {
        router.refresh()
      }
    } catch {
      setSubmissions((p) => p.map((s) => s.id === id ? { ...s, status: prev.status } : s))
      setErrorIds((p) => new Set(p).add(id))
    } finally {
      setUpdatingIds((p) => { const n = new Set(p); n.delete(id); return n })
    }
  }, [submissions, updatingIds, router])

  // Derived stats
  const derivedStats = useMemo(() => {
    const total  = filtered.length
    const scored = filtered.filter((s) => s.total > 0)
    const avg    = scored.length
      ? parseFloat((scored.reduce((a, s) => a + pct(s.score, s.total), 0) / scored.length).toFixed(1))
      : 0
    const top    = filtered.reduce((max, s) => Math.max(max, s.score), 0)
    const passed = filtered.filter((s) => s.total > 0 && pct(s.score, s.total) >= 50).length
    return { total, avg, top, passed }
  }, [filtered])

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="h-48 w-full rounded-xl border border-border bg-card" />
        <div className="h-10 w-full rounded-lg bg-muted" />
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-10 border-b border-border bg-muted/40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="ml-auto h-4 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value={derivedStats.total.toLocaleString()}
          sub="quiz entries"
          accent="text-foreground"
        />
        <StatCard
          label="Avg Score %"
          value={`${derivedStats.avg}%`}
          sub="across filtered rows"
          accent={derivedStats.avg >= 70 ? "text-emerald-600" : derivedStats.avg >= 40 ? "text-amber-600" : "text-red-600"}
        />
        <StatCard
          label="Top Score"
          value={stats.totalQuestions ? `${derivedStats.top}/${stats.totalQuestions}` : derivedStats.top}
          sub="highest correct answers"
          accent="text-primary"
        />
        <StatCard
          label="Pass Rate"
          value={derivedStats.total ? `${Math.round((derivedStats.passed / derivedStats.total) * 100)}%` : "—"}
          sub="≥ 50% correct"
          accent={
            derivedStats.total
              ? Math.round((derivedStats.passed / derivedStats.total) * 100) >= 60
                ? "text-emerald-600" : "text-amber-600"
              : "text-foreground"
          }
        />
      </div>

      {/* Leaderboard */}
      <LeaderboardPanel entries={leaderboard} totalQuestions={stats.totalQuestions} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="relative">
          <select
            value={filterComp}
            onChange={(e) => handleCompFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Quizzes</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="winner">Winner</option>
            <option value="disqualified">Disqualified</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {(search || filterStatus !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus("all") }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">User</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Competition</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Correct / Total</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide md:table-cell">Time</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Submitted</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Rank</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                  No quiz submissions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                const busy   = updatingIds.has(sub.id)
                const hasErr = errorIds.has(sub.id)
                const p      = pct(sub.score, sub.total)

                return (
                  <TableRow key={sub.id} className="group">
                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {shortId(sub.userId).slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-mono text-[11px] font-semibold text-foreground">
                            {shortId(sub.userId)}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {sub.userId.slice(0, 14)}…
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Competition */}
                    <TableCell>
                      <p className="max-w-[140px] truncate text-sm text-foreground">
                        {sub.competition?.title ?? "—"}
                      </p>
                    </TableCell>

                    {/* Score badge */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit text-xs font-bold ${scoreBadgeClass(sub.score, sub.total)}`}>
                          {sub.total > 0 ? `${p}%` : `${sub.score} pts`}
                        </Badge>
                        {sub.total > 0 && <ScoreBar score={sub.score} total={sub.total} />}
                      </div>
                    </TableCell>

                    {/* Correct / Total */}
                    <TableCell>
                      <span className="font-mono text-sm">
                        <span className="font-bold text-emerald-600">{sub.score}</span>
                        <span className="text-muted-foreground">/{sub.total || "?"}</span>
                      </span>
                    </TableCell>

                    {/* Time taken — not tracked yet */}
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </TableCell>

                    {/* Submitted At */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(sub.createdAt)}
                      </span>
                    </TableCell>

                    {/* Rank */}
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-bold ${rankBadgeClass(sub.rank)}`}>
                        {rankEmoji(sub.rank)}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Badge
                          variant="outline"
                          className={`w-fit text-[10px] ${
                            sub.status === "active"       ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                            sub.status === "disqualified" ? "border-red-200 bg-red-50 text-red-700" :
                            "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </Badge>
                        {hasErr && <span className="text-[9px] text-destructive">Update failed</span>}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={busy}
                          >
                            <EllipsisIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="gap-2 text-sm"
                            onClick={() => { setDetailSub(sub); setDetailOpen(true) }}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {sub.status !== "winner" && (
                            <DropdownMenuItem
                              className="gap-2 text-sm text-amber-600 focus:text-amber-600"
                              onClick={() => updateStatus(sub.id, "winner")}
                            >
                              <TrophyIcon className="h-4 w-4" />
                              Mark as Winner
                            </DropdownMenuItem>
                          )}

                          {sub.status !== "active" && (
                            <DropdownMenuItem
                              className="gap-2 text-sm text-emerald-600 focus:text-emerald-600"
                              onClick={() => updateStatus(sub.id, "active")}
                            >
                              <CheckIcon className="h-4 w-4" />
                              Restore to Active
                            </DropdownMenuItem>
                          )}

                          {sub.status !== "disqualified" && (
                            <DropdownMenuItem
                              className="gap-2 text-sm text-destructive focus:text-destructive"
                              onClick={() => updateStatus(sub.id, "disqualified")}
                            >
                              <BanIcon className="h-4 w-4" />
                              Disqualify
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
              <span className="font-medium text-foreground">{submissions.length}</span> quiz submissions
            </p>
          </div>
        )}
      </div>

      <QuestionReviewModal
        submission={detailSub}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
