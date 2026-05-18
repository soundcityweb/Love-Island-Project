"use client"

import { useState, useMemo, useEffect, useTransition, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import type { CompetitionOption } from "@/types/admin-competition"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OptionDist {
  option:    string
  count:     number
  pct:       number
  isCorrect: boolean | null  // null = result not declared
}

export interface PredictionQuestionDto {
  id:             string
  competitionId:  string
  question:       string
  correctAnswer:  string | null
  resultDeclared: boolean
  totalVotes:     number
  options:        OptionDist[]
}

export interface QuestionResult {
  questionId:     string
  question:       string
  userAnswer:     string | null
  correctAnswer:  string | null
  isCorrect:      boolean | null
  resultDeclared: boolean
}

export type SubmissionStatus = "active" | "disqualified" | "winner"

export interface PredictionSubmission {
  id:              string
  userId:          string
  competitionId:   string
  competition:     { id: string; title: string; slug: string } | null
  selectedOption:  string | null   // primary question answer
  correctAnswer:   string | null   // primary question correct answer
  isCorrect:       boolean | null  // primary question result
  resultDeclared:  boolean
  allCorrect:      boolean
  anyWrong:        boolean
  questionResults: QuestionResult[]
  status:          SubmissionStatus
  createdAt:       string
}

export interface PredictionStats {
  totalSubmissions:   number
  uniqueParticipants: number
  correctPredictions: number
  accuracy:           number | null
  resultDeclared:     boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shortId  = (id: string) => id.slice(0, 8).toUpperCase()
const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString("en-NG", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
})

// Option palette — rotates through a set of distinct colours
const OPTION_COLORS = [
  { bar: "bg-violet-500",  badge: "border-violet-200 bg-violet-50 text-violet-700"  },
  { bar: "bg-sky-500",     badge: "border-sky-200    bg-sky-50    text-sky-700"     },
  { bar: "bg-amber-500",   badge: "border-amber-200  bg-amber-50  text-amber-700"   },
  { bar: "bg-rose-500",    badge: "border-rose-200   bg-rose-50   text-rose-700"    },
  { bar: "bg-teal-500",    badge: "border-teal-200   bg-teal-50   text-teal-700"    },
  { bar: "bg-fuchsia-500", badge: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700" },
]
const optColor = (idx: number) => OPTION_COLORS[idx % OPTION_COLORS.length]

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon  = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)
const ChevronIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)
const CheckIcon   = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)
const XIcon       = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)
const EyeIcon     = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)
const BarChartIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${accent ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Option Distribution Bar Chart ───────────────────────────────────────────

function OptionBar({
  opt,
  idx,
  totalVotes,
  resultDeclared,
}: {
  opt: OptionDist
  idx: number
  totalVotes: number
  resultDeclared: boolean
}) {
  const color      = optColor(idx)
  const isCorrect  = resultDeclared && opt.isCorrect === true
  const isWrong    = resultDeclared && opt.isCorrect === false

  const barClass = isCorrect
    ? "bg-emerald-500"
    : isWrong
    ? "bg-red-400"
    : color.bar

  return (
    <div className={`group rounded-xl border p-4 transition-colors ${
      isCorrect ? "border-emerald-200"
      : isWrong  ? "border-red-100"
      :            "border-border    bg-card"
    }`}>
      {/* Option label row */}
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Correctness icon */}
          {isCorrect && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckIcon cls="h-3 w-3" />
            </span>
          )}
          {isWrong && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400 text-white">
              <XIcon cls="h-3 w-3" />
            </span>
          )}
          {!resultDeclared && (
            <span className={`h-3 w-3 shrink-0 rounded-full ${color.bar}`} />
          )}
          <span className={`truncate text-sm font-medium ${
            isCorrect ? "text-emerald-800"
            : isWrong  ? "text-red-700"
            :            "text-foreground"
          }`}>
            {opt.option}
          </span>
          {isCorrect && (
            <Badge variant="outline" className="shrink-0 border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700">
              Correct
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{opt.count} votes</span>
          <span className={`text-sm font-bold tabular-nums ${
            isCorrect ? "text-emerald-700"
            : isWrong  ? "text-red-600"
            :            "text-foreground"
          }`}>
            {opt.pct}%
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${Math.max(opt.pct, 1)}%` }}
        />
      </div>

      {/* Fraction below bar */}
      <p className="mt-1 text-[10px] text-muted-foreground">
        {opt.count} / {totalVotes || "—"}
      </p>
    </div>
  )
}

function DistributionPanel({ questions }: { questions: PredictionQuestionDto[] }) {
  if (!questions.length) return null

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
        <BarChartIcon cls="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Option Distribution</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-border">
        {questions.map((q) => (
          <div key={q.id} className="px-5 py-5">
            {/* Question header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{q.question}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {q.totalVotes} total vote{q.totalVotes !== 1 ? "s" : ""}
                </p>
              </div>
              <Badge
                variant="outline"
                className={q.resultDeclared
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]"
                  : "border-amber-200 bg-amber-50 text-amber-700 text-[10px]"
                }
              >
                {q.resultDeclared ? "Result Declared" : "Pending"}
              </Badge>
            </div>

            {/* Option bars */}
            <div className="space-y-2.5">
              {q.options
                .slice()
                .sort((a, b) => b.pct - a.pct)
                .map((opt, idx) => (
                  <OptionBar
                    key={opt.option}
                    opt={opt}
                    idx={idx}
                    totalVotes={q.totalVotes}
                    resultDeclared={q.resultDeclared}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Prediction Detail Modal ──────────────────────────────────────────────────

function PredictionDetailModal({
  submission,
  open,
  onClose,
}: {
  submission: PredictionSubmission | null
  open: boolean
  onClose: () => void
}) {
  if (!submission) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Prediction Details
            {submission.resultDeclared && (
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  submission.allCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {submission.allCorrect ? "All Correct ✓" : "Incorrect ✗"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {submission.competition?.title ?? "Prediction"} &nbsp;·&nbsp;
            User <span className="font-mono">{shortId(submission.userId)}</span>
            &nbsp;·&nbsp; {fmtDate(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Legend */}
        {submission.resultDeclared && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-300" />
              Correct prediction
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-100 ring-1 ring-red-300" />
              Wrong prediction
            </span>
          </div>
        )}

        <Separator />

        {/* Per-question breakdown */}
        <div className="space-y-4">
          {submission.questionResults.length === 0 ? (
            <p className="py-6 text-center text-sm italic text-muted-foreground">
              No question data available.
            </p>
          ) : (
            submission.questionResults.map((r, idx) => {
              const declared = r.resultDeclared
              const correct  = r.isCorrect === true
              const wrong    = r.isCorrect === false

              let cardCls = "rounded-xl border p-4 "
              if (declared && correct) cardCls += "border-emerald-200"
              else if (declared && wrong) cardCls += "border-red-200"
              else cardCls += "border-border bg-muted/20"

              return (
                <div key={r.questionId} className={cardCls}>
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                      declared && correct ? "bg-emerald-500"
                      : declared && wrong ? "bg-red-500"
                      : "bg-muted-foreground"
                    }`}>
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-foreground leading-snug">{r.question}</p>
                    {declared && (
                      <span className={`mt-0.5 shrink-0 rounded-full p-0.5 ${correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                        {correct ? <CheckIcon cls="h-4 w-4" /> : <XIcon cls="h-4 w-4" />}
                      </span>
                    )}
                  </div>

                  {/* Answer chips */}
                  <div className="mt-3 space-y-2 pl-9">
                    {/* User's pick */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[11px] text-muted-foreground">Your pick</span>
                      <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                        declared && correct ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                        : declared && wrong  ? "border-red-300   bg-red-100   text-red-800"
                        :                      "border-primary/20 bg-primary/5  text-primary"
                      }`}>
                        {r.userAnswer ?? <em className="text-muted-foreground">no answer</em>}
                      </span>
                    </div>

                    {/* Correct answer (if declared) */}
                    {declared && r.correctAnswer && (
                      <div className="flex items-center gap-2">
                        <span className="w-20 shrink-0 text-[11px] text-muted-foreground">Correct</span>
                        <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {r.correctAnswer}
                        </span>
                      </div>
                    )}

                    {/* Not yet declared */}
                    {!declared && (
                      <p className="text-[11px] italic text-muted-foreground">
                        Result not yet declared.
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Is Correct Badge ─────────────────────────────────────────────────────────

function CorrectBadge({ isCorrect, resultDeclared }: { isCorrect: boolean | null; resultDeclared: boolean }) {
  if (!resultDeclared) {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px]">
        Pending
      </Badge>
    )
  }
  if (isCorrect === true) {
    return (
      <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
        <CheckIcon cls="h-3 w-3" /> Correct
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 border-red-300 bg-red-50 text-red-700 text-[10px] font-semibold">
      <XIcon cls="h-3 w-3" /> Wrong
    </Badge>
  )
}

// ─── Selected Option Badge ────────────────────────────────────────────────────

function OptionBadge({
  option,
  isCorrect,
  resultDeclared,
}: {
  option: string | null
  isCorrect: boolean | null
  resultDeclared: boolean
}) {
  if (!option) return <span className="text-xs italic text-muted-foreground">—</span>

  let cls = "max-w-[160px] truncate rounded-lg border px-2.5 py-1 text-xs font-medium "
  if (resultDeclared && isCorrect === true)  cls += "border-emerald-300 bg-emerald-100 text-emerald-800"
  else if (resultDeclared && isCorrect === false) cls += "border-red-300 bg-red-100 text-red-800"
  else cls += "border-primary/20 bg-primary/5 text-primary"

  return <span className={cls} title={option}>{option}</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PredictionSubmissionsTable({
  initialSubmissions,
  initialStats,
  initialQuestions,
  competitions,
  defaultCompetitionId,
}: {
  initialSubmissions: PredictionSubmission[]
  initialStats: PredictionStats
  initialQuestions: PredictionQuestionDto[]
  competitions: CompetitionOption[]
  defaultCompetitionId?: string
}) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [submissions] = useState(initialSubmissions)
  const [stats]       = useState(initialStats)
  const [questions]   = useState(initialQuestions)

  const [search, setSearch]           = useState("")
  const [filterComp, setFilterComp]   = useState(defaultCompetitionId ?? "all")
  const [filterResult, setResult]     = useState<"all" | "correct" | "wrong" | "pending">("all")

  const [detailSub, setDetailSub]     = useState<PredictionSubmission | null>(null)
  const [detailOpen, setDetailOpen]   = useState(false)

  // Sync competition filter → URL
  const handleCompFilter = useCallback((val: string) => {
    setFilterComp(val)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (val === "all") params.delete("competition")
      else params.set("competition", val)
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [router, pathname, searchParams])

  // Filter questions to active competition
  const visibleQuestions = useMemo(() => {
    if (filterComp === "all") return questions
    return questions.filter((q) => q.competitionId === filterComp)
  }, [questions, filterComp])

  // Filtered submissions
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filterComp !== "all" && s.competitionId !== filterComp) return false
      if (filterResult === "correct" && s.isCorrect !== true)    return false
      if (filterResult === "wrong"   && s.isCorrect !== false)   return false
      if (filterResult === "pending" && s.resultDeclared)        return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.userId.toLowerCase().includes(q) &&
            !(s.competition?.title.toLowerCase().includes(q) ?? false)) return false
      }
      return true
    })
  }, [submissions, filterComp, filterResult, search])

  // Derived stats from filtered rows
  const derived = useMemo(() => {
    const total    = filtered.length
    const declared = filtered.filter((s) => s.resultDeclared)
    const correct  = declared.filter((s) => s.allCorrect).length
    const accuracy = declared.length ? Math.round((correct / declared.length) * 100) : null
    const pending  = filtered.filter((s) => !s.resultDeclared).length
    return { total, correct, accuracy, pending }
  }, [filtered])

  // Skeleton
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="h-72 rounded-xl border border-border bg-card" />
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-64 rounded-xl border border-border bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Stat cards ─── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value={derived.total.toLocaleString()}
          sub="prediction entries"
        />
        <StatCard
          label="Correct Predictions"
          value={derived.correct.toLocaleString()}
          sub={stats.resultDeclared ? "result declared" : "pending result"}
          accent={stats.resultDeclared ? "text-emerald-600" : "text-muted-foreground"}
        />
        <StatCard
          label="Accuracy Rate"
          value={derived.accuracy !== null ? `${derived.accuracy}%` : "—"}
          sub="of declared results"
          accent={
            derived.accuracy === null ? undefined :
            derived.accuracy >= 60 ? "text-emerald-600" :
            derived.accuracy >= 30 ? "text-amber-600" :
            "text-red-600"
          }
        />
        <StatCard
          label="Pending Results"
          value={derived.pending.toLocaleString()}
          sub="awaiting result declaration"
          accent={derived.pending > 0 ? "text-amber-600" : undefined}
        />
      </div>

      {/* ── Option distribution chart ─── */}
      <DistributionPanel questions={visibleQuestions} />

      {/* ── Filters ─── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon cls="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user ID or competition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Competition filter */}
        <div className="relative">
          <select
            value={filterComp}
            onChange={(e) => handleCompFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Predictions</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <ChevronIcon cls="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Result filter */}
        <div className="relative">
          <select
            value={filterResult}
            onChange={(e) => setResult(e.target.value as typeof filterResult)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Results</option>
            <option value="correct">Correct Only</option>
            <option value="wrong">Wrong Only</option>
            <option value="pending">Pending Only</option>
          </select>
          <ChevronIcon cls="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {(search || filterResult !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setResult("all") }}>
            Clear
          </Button>
        )}
      </div>

      {/* ── Table ─── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">User</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Competition</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Selected Option</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Is Correct</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide md:table-cell">Status</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide lg:table-cell">Submitted At</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                  {submissions.length === 0
                    ? "No prediction submissions found."
                    : "No submissions match the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                // Row highlight after result declared
                const rowHighlight =
                  sub.resultDeclared && sub.allCorrect
                    ? ""
                    : sub.resultDeclared && sub.anyWrong
                    ? ""
                    : ""

                return (
                  <TableRow key={sub.id} className={`group ${rowHighlight}`}>
                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          sub.resultDeclared && sub.allCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : sub.resultDeclared && sub.anyWrong
                            ? "bg-red-100 text-red-700"
                            : "bg-muted text-muted-foreground"
                        }`}>
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

                    {/* Competition */}
                    <TableCell>
                      <p className="max-w-[150px] truncate text-sm text-foreground">
                        {sub.competition?.title ?? "—"}
                      </p>
                    </TableCell>

                    {/* Selected option */}
                    <TableCell>
                      <OptionBadge
                        option={sub.selectedOption}
                        isCorrect={sub.isCorrect}
                        resultDeclared={sub.resultDeclared}
                      />
                    </TableCell>

                    {/* Is correct */}
                    <TableCell>
                      <CorrectBadge isCorrect={sub.isCorrect} resultDeclared={sub.resultDeclared} />
                    </TableCell>

                    {/* Status */}
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`text-[10px] capitalize ${
                        sub.status === "active"       ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                        sub.status === "disqualified" ? "border-red-200 bg-red-50 text-red-700" :
                        "border-amber-200 bg-amber-50 text-amber-700"
                      }`}>
                        {sub.status}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="hidden lg:table-cell">
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDate(sub.createdAt)}
                      </span>
                    </TableCell>

                    {/* View */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => { setDetailSub(sub); setDetailOpen(true) }}
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

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{filtered.length}</span>
              {" "}of{" "}
              <span className="font-medium text-foreground">{submissions.length}</span>
              {" "}prediction submissions
            </p>
            {stats.resultDeclared && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-emerald-600">{derived.correct} correct</span>
                {" · "}
                <span className="font-medium text-red-600">{derived.total - derived.correct} wrong</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Detail modal ─── */}
      <PredictionDetailModal
        submission={detailSub}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
