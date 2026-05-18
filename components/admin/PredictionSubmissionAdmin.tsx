"use client"

/**
 * PredictionSubmissionAdmin
 *
 * Self-contained component for managing predictions for a single competition.
 * Drop it anywhere with just a competitionId prop.
 *
 * Features
 * ─────────
 * • Fetches all prediction submissions + question metadata
 * • Option distribution chart — horizontal bars, % labels, vote counts
 * • "Set as Correct" button per option → PATCH updates question.correctAnswer
 * • After declaration: correct rows glow green, wrong rows dim red
 * • Grouped view — collapsible option buckets with user lists
 * • Flat table — User | Selected | Is Correct badge | Date | Detail button
 * • Detail modal — per-question answer breakdown
 * • All views re-derive from the same in-memory state after any declaration
 *
 * Usage:
 *   <PredictionSubmissionAdmin competitionId="uuid" title="Who Goes Home?" />
 */

import { useState, useEffect, useMemo, useCallback } from "react"
import { Badge }     from "@/components/ui/badge"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OptionDist {
  option:    string
  count:     number
  pct:       number
  isCorrect: boolean | null
}

interface PredQuestionDto {
  id:             string
  competitionId:  string
  question:       string
  correctAnswer:  string | null
  resultDeclared: boolean
  totalVotes:     number
  options:        OptionDist[]
}

interface QuestionResult {
  questionId:     string
  question:       string
  userAnswer:     string | null
  correctAnswer:  string | null
  isCorrect:      boolean | null
  resultDeclared: boolean
}

interface PredSubmission {
  id:              string
  userId:          string
  competitionId:   string
  competition:     { id: string; title: string; slug: string } | null
  selectedOption:  string | null
  correctAnswer:   string | null
  isCorrect:       boolean | null
  resultDeclared:  boolean
  allCorrect:      boolean
  anyWrong:        boolean
  questionResults: QuestionResult[]
  status:          "active" | "disqualified" | "winner"
  createdAt:       string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const shortId = (id: string) => id.slice(0, 8).toUpperCase()
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

/** Palette rotated per option index */
const PALETTE = [
  { bar: "bg-violet-500",  hover: "hover:bg-violet-600", ring: "ring-violet-300",  text: "text-violet-700",  light: "bg-violet-50",  border: "border-violet-200" },
  { bar: "bg-sky-500",     hover: "hover:bg-sky-600",    ring: "ring-sky-300",     text: "text-sky-700",     light: "bg-sky-50",     border: "border-sky-200"    },
  { bar: "bg-amber-500",   hover: "hover:bg-amber-600",  ring: "ring-amber-300",   text: "text-amber-700",   light: "bg-amber-50",   border: "border-amber-200"  },
  { bar: "bg-rose-500",    hover: "hover:bg-rose-600",   ring: "ring-rose-300",    text: "text-rose-700",    light: "bg-rose-50",    border: "border-rose-200"   },
  { bar: "bg-teal-500",    hover: "hover:bg-teal-600",   ring: "ring-teal-300",    text: "text-teal-700",    light: "bg-teal-50",    border: "border-teal-200"   },
  { bar: "bg-fuchsia-500", hover: "hover:bg-fuchsia-600",ring: "ring-fuchsia-300", text: "text-fuchsia-700", light: "bg-fuchsia-50", border: "border-fuchsia-200"},
]
const pal = (i: number) => PALETTE[i % PALETTE.length]

// ─── Tiny icons ────────────────────────────────────────────────────────────────

const CheckIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)
const XIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)
const ChevronIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)
const SearchIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)
const EyeIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)
const SpinnerIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)
const GridIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
)
const ListIcon = ({ cls = "" }: { cls?: string }) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
)

// ─── Stat Card ─────────────────────────────────────────────────────────────────

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

// ─── Option Distribution Chart ─────────────────────────────────────────────────

function DistributionChart({
  question,
  onSetCorrect,
  settingFor,
}: {
  question:    PredQuestionDto
  onSetCorrect: (questionId: string, option: string | null) => Promise<void>
  settingFor:  string | null   // option currently being saved
}) {
  const sorted = [...question.options].sort((a, b) => b.pct - a.pct)

  // Map original option → palette index (stable order from question.options)
  const idxMap = new Map(question.options.map((o, i) => [o.option, i]))

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-5 py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{question.question}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {question.totalVotes} vote{question.totalVotes !== 1 ? "s" : ""}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              question.resultDeclared
                ? "shrink-0 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                : "shrink-0 border-amber-200  bg-amber-50  text-[10px] text-amber-700"
            }
          >
            {question.resultDeclared ? `✓ ${question.correctAnswer}` : "Result Pending"}
          </Badge>
        </div>
      </div>

      {/* Option bars */}
      <div className="divide-y divide-border/60">
        {sorted.map((opt) => {
          const idx       = idxMap.get(opt.option) ?? 0
          const color     = pal(idx)
          const isCorrect = question.resultDeclared && opt.isCorrect === true
          const isWrong   = question.resultDeclared && opt.isCorrect === false
          const isSaving  = settingFor === opt.option
          const isCurrent = question.correctAnswer === opt.option

          const barColor  = isCorrect ? "bg-emerald-500"
                          : isWrong   ? "bg-red-400/70"
                          :             color.bar

          const cardBg    = isCorrect ? "bg-emerald-50/60"
                          : isWrong   ? "bg-red-50/30"
                          :             "bg-background"

          return (
            <div key={opt.option} className={`group px-5 py-4 transition-colors ${cardBg}`}>
              {/* Option header row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {/* State dot / icon */}
                  {isCorrect ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckIcon cls="h-3 w-3" />
                    </span>
                  ) : isWrong ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400 text-white">
                      <XIcon cls="h-3 w-3" />
                    </span>
                  ) : (
                    <span className={`h-3 w-3 shrink-0 rounded-full ${color.bar}`} />
                  )}

                  <span className={`truncate text-sm font-medium ${
                    isCorrect ? "text-emerald-800"
                    : isWrong ? "text-red-700"
                    :           "text-foreground"
                  }`}>
                    {opt.option}
                  </span>

                  {isCurrent && !question.resultDeclared && (
                    <Badge variant="outline" className="shrink-0 border-emerald-200 bg-emerald-50 text-[9px] text-emerald-700">
                      Selected
                    </Badge>
                  )}
                </div>

                {/* Vote count + % + action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{opt.count} votes</span>
                  <span className={`w-10 text-right text-sm font-bold tabular-nums ${
                    isCorrect ? "text-emerald-700"
                    : isWrong  ? "text-red-600"
                    :            "text-foreground"
                  }`}>
                    {opt.pct}%
                  </span>

                  {/* Set/Unset button */}
                  {isCurrent ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 border-red-200 bg-red-50 px-2.5 text-[10px] font-semibold text-red-700 hover:bg-red-100 hover:text-red-800"
                      disabled={isSaving}
                      onClick={() => onSetCorrect(question.id, null)}
                    >
                      {isSaving ? <SpinnerIcon cls="h-3 w-3" /> : <XIcon cls="h-3 w-3" />}
                      Unset
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                      disabled={isSaving || !!settingFor}
                      onClick={() => onSetCorrect(question.id, opt.option)}
                    >
                      {isSaving ? <SpinnerIcon cls="h-3 w-3" /> : <CheckIcon cls="h-3 w-3" />}
                      Set Correct
                    </Button>
                  )}
                </div>
              </div>

              {/* Bar track */}
              <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(opt.pct, 1)}%` }}
                />
              </div>

              {/* Fraction */}
              <p className="mt-1 text-[10px] text-muted-foreground">
                {opt.count} / {question.totalVotes || "—"}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Grouped View ───────────────────────────────────────────────────────────────

function GroupedView({
  submissions,
  questions,
}: {
  submissions: PredSubmission[]
  questions:   PredQuestionDto[]
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // For each primary-question option, group submissions
  const primaryQ = questions[0]
  if (!primaryQ) return (
    <p className="py-8 text-center text-sm italic text-muted-foreground">
      No question data available.
    </p>
  )

  const idxMap = new Map(primaryQ.options.map((o, i) => [o.option, i]))

  // Build groups: option → submissions
  const groups: Record<string, PredSubmission[]> = {}
  for (const opt of primaryQ.options) groups[opt.option] = []
  groups["(no answer)"] = []

  for (const s of submissions) {
    const key = s.selectedOption ?? "(no answer)"
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }

  const groupEntries = Object.entries(groups)
    .filter(([, subs]) => subs.length > 0)
    .sort(([, a], [, b]) => b.length - a.length)

  return (
    <div className="space-y-3">
      {groupEntries.map(([option, subs]) => {
        const idx   = idxMap.get(option) ?? -1
        const color = idx >= 0 ? pal(idx) : { bar: "bg-muted", light: "bg-muted/30", border: "border-border", text: "text-muted-foreground", ring: "", hover: "" }
        const optData = primaryQ.options.find((o) => o.option === option)
        const isCorrect = primaryQ.resultDeclared && optData?.isCorrect === true
        const isWrong   = primaryQ.resultDeclared && optData?.isCorrect === false
        const isOpen    = expanded[option] ?? false
        const pct       = primaryQ.totalVotes > 0 ? Math.round((subs.length / primaryQ.totalVotes) * 100) : 0

        return (
          <div
            key={option}
            className={`overflow-hidden rounded-xl border transition-colors ${
              isCorrect ? "border-emerald-200"
              : isWrong  ? "border-red-200"
              :            "border-border"
            }`}
          >
            {/* Group header — click to expand */}
            <button
              type="button"
              className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                isCorrect ? "bg-emerald-50/70 hover:bg-emerald-50"
                : isWrong  ? "bg-red-50/50   hover:bg-red-50/70"
                :            "bg-card        hover:bg-muted/30"
              }`}
              onClick={() => setExpanded((p) => ({ ...p, [option]: !isOpen }))}
            >
              {/* Colour swatch */}
              <span className={`h-3 w-3 shrink-0 rounded-full ${
                isCorrect ? "bg-emerald-500"
                : isWrong  ? "bg-red-400"
                :            color.bar
              }`} />

              <span className={`flex-1 text-sm font-semibold ${
                isCorrect ? "text-emerald-800"
                : isWrong  ? "text-red-700"
                :            "text-foreground"
              }`}>
                {option}
              </span>

              {/* Result badge */}
              {primaryQ.resultDeclared && (
                isCorrect ? (
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700 gap-1">
                    <CheckIcon cls="h-3 w-3" /> Correct
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-300 bg-red-50 text-[10px] text-red-700 gap-1">
                    <XIcon cls="h-3 w-3" /> Wrong
                  </Badge>
                )
              )}

              {/* Count + pct */}
              <span className="text-xs text-muted-foreground">{subs.length} users · {pct}%</span>
              <ChevronIcon cls={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* User list */}
            {isOpen && (
              <div className="border-t border-border">
                <div className="divide-y divide-border/50">
                  {subs.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                        {shortId(s.userId).slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[11px] font-semibold text-foreground">
                          {shortId(s.userId)}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {s.userId.slice(0, 20)}…
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                        {fmtDate(s.createdAt)}
                      </span>
                      {primaryQ.resultDeclared && (
                        s.isCorrect === true ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckIcon cls="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <XIcon cls="h-3 w-3" />
                          </span>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Detail Modal ───────────────────────────────────────────────────────────────

function DetailModal({
  sub,
  open,
  onClose,
}: {
  sub:     PredSubmission | null
  open:    boolean
  onClose: () => void
}) {
  if (!sub) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Prediction Details
            {sub.resultDeclared && (
              <Badge variant="outline" className={`text-xs font-semibold ${
                sub.allCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-red-300 bg-red-50 text-red-700"
              }`}>
                {sub.allCorrect ? "All Correct ✓" : "Incorrect ✗"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {sub.competition?.title ?? "Prediction"} &nbsp;·&nbsp;
            User <span className="font-mono">{shortId(sub.userId)}</span>
            &nbsp;·&nbsp; {fmtDate(sub.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          {sub.questionResults.length === 0 ? (
            <p className="py-6 text-center text-sm italic text-muted-foreground">No question data.</p>
          ) : (
            sub.questionResults.map((r, i) => {
              const correct  = r.isCorrect === true
              const wrong    = r.isCorrect === false
              const declared = r.resultDeclared

              return (
                <div key={r.questionId} className={`rounded-xl border p-4 ${
                  declared && correct ? "border-emerald-200 bg-emerald-50/50"
                  : declared && wrong  ? "border-red-200 bg-red-50/40"
                  :                      "border-border bg-muted/20"
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                      declared && correct ? "bg-emerald-500"
                      : declared && wrong  ? "bg-red-500"
                      :                      "bg-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold leading-snug text-foreground">{r.question}</p>
                    {declared && (
                      <span className={`mt-0.5 shrink-0 rounded-full p-0.5 ${correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                        {correct ? <CheckIcon cls="h-4 w-4" /> : <XIcon cls="h-4 w-4" />}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 pl-9">
                    <div className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[11px] text-muted-foreground">User picked</span>
                      <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                        declared && correct ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                        : declared && wrong  ? "border-red-300 bg-red-100 text-red-800"
                        :                      "border-primary/20 bg-primary/5 text-primary"
                      }`}>
                        {r.userAnswer ?? <em className="not-italic text-muted-foreground">no answer</em>}
                      </span>
                    </div>
                    {declared && r.correctAnswer && (
                      <div className="flex items-center gap-2">
                        <span className="w-24 shrink-0 text-[11px] text-muted-foreground">Correct answer</span>
                        <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {r.correctAnswer}
                        </span>
                      </div>
                    )}
                    {!declared && (
                      <p className="text-[11px] italic text-muted-foreground">Result not yet declared.</p>
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

// ─── Is Correct Badge ───────────────────────────────────────────────────────────

function CorrectBadge({ isCorrect, declared }: { isCorrect: boolean | null; declared: boolean }) {
  if (!declared) return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">
      Pending
    </Badge>
  )
  return isCorrect ? (
    <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-[10px] font-semibold text-emerald-700">
      <CheckIcon cls="h-3 w-3" /> Correct
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 border-red-300 bg-red-50 text-[10px] font-semibold text-red-700">
      <XIcon cls="h-3 w-3" /> Wrong
    </Badge>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export interface PredictionSubmissionAdminProps {
  /** UUID of the prediction competition to manage. */
  competitionId: string
  /** Optional section header title. */
  title?: string
}

export function PredictionSubmissionAdmin({
  competitionId,
  title,
}: PredictionSubmissionAdminProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<PredSubmission[]>([])
  const [questions, setQuestions]   = useState<PredQuestionDto[]>([])

  const [view, setView]             = useState<"chart" | "grouped" | "table">("chart")
  const [search, setSearch]         = useState("")
  const [filter, setFilter]         = useState<"all" | "correct" | "wrong" | "pending">("all")

  const [detailSub, setDetailSub]   = useState<PredSubmission | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  /** questionId + option currently being saved */
  const [saving, setSaving]         = useState<{ questionId: string; option: string | null } | null>(null)
  const [saveError, setSaveError]   = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/competitions/prediction-submissions?competitionId=${competitionId}&limit=200`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()

      setSubmissions(
        (body.data ?? []).map((s: any): PredSubmission => ({
          id:              s.id,
          userId:          s.userId,
          competitionId:   s.competitionId,
          competition:     s.competition ?? null,
          selectedOption:  s.selectedOption ?? null,
          correctAnswer:   s.correctAnswer ?? null,
          isCorrect:       s.isCorrect ?? null,
          resultDeclared:  Boolean(s.resultDeclared),
          allCorrect:      Boolean(s.allCorrect),
          anyWrong:        Boolean(s.anyWrong),
          questionResults: (s.questionResults ?? []).map((r: any) => ({
            questionId:     r.questionId,
            question:       r.question,
            userAnswer:     r.userAnswer ?? null,
            correctAnswer:  r.correctAnswer ?? null,
            isCorrect:      r.isCorrect ?? null,
            resultDeclared: Boolean(r.resultDeclared),
          })),
          status:    s.status ?? "active",
          createdAt: s.createdAt,
        })),
      )

      setQuestions(
        (body.questions ?? []).map((q: any): PredQuestionDto => ({
          id:             q.id,
          competitionId:  q.competitionId,
          question:       q.question,
          correctAnswer:  q.correctAnswer ?? null,
          resultDeclared: Boolean(q.resultDeclared),
          totalVotes:     q.totalVotes ?? 0,
          options:        (q.options ?? []).map((o: any) => ({
            option:    o.option,
            count:     o.count ?? 0,
            pct:       o.pct ?? 0,
            isCorrect: o.isCorrect ?? null,
          })),
        })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load submissions.")
    } finally {
      setLoading(false)
    }
  }, [competitionId])

  useEffect(() => { load() }, [load])

  // ── Set correct answer ─────────────────────────────────────────────────────
  const handleSetCorrect = useCallback(async (questionId: string, option: string | null) => {
    setSaving({ questionId, option })
    setSaveError(null)
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/questions/${questionId}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ correctAnswer: option ?? "" }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).message ?? `HTTP ${res.status}`)
      }
      // Re-fetch to get recalculated distribution + isCorrect flags
      await load()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.")
    } finally {
      setSaving(null)
    }
  }, [competitionId, load])

  // ── Filtered / sorted rows ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filter === "correct" && s.isCorrect !== true)  return false
      if (filter === "wrong"   && s.isCorrect !== false) return false
      if (filter === "pending" && s.resultDeclared)      return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.userId.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [submissions, filter, search])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = submissions.length
    const declared = submissions.filter((s) => s.resultDeclared)
    const correct  = declared.filter((s) => s.allCorrect).length
    const accuracy = declared.length ? Math.round((correct / declared.length) * 100) : null
    const pending  = submissions.filter((s) => !s.resultDeclared).length
    return { total, correct, accuracy, pending }
  }, [submissions])

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="flex items-center justify-center py-24">
          <SpinnerIcon cls="h-6 w-6 text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load predictions</p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={load}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Section header ── */}
      {title && (
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Prediction competition · declare results per question
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Entries"  value={stats.total}  sub="prediction submissions" />
        <StatCard
          label="Correct"
          value={stats.correct}
          sub="all questions right"
          accent={questions.some((q) => q.resultDeclared) ? "text-emerald-600" : undefined}
        />
        <StatCard
          label="Accuracy"
          value={stats.accuracy !== null ? `${stats.accuracy}%` : "—"}
          sub="of declared results"
          accent={
            stats.accuracy === null ? undefined :
            stats.accuracy >= 60 ? "text-emerald-600" :
            stats.accuracy >= 30 ? "text-amber-600"  : "text-red-600"
          }
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          sub="awaiting declaration"
          accent={stats.pending > 0 ? "text-amber-600" : undefined}
        />
      </div>

      {/* ── Save error banner ── */}
      {saveError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <p className="text-sm text-destructive">{saveError}</p>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSaveError(null)}>Dismiss</Button>
        </div>
      )}

      {/* ── View toggle ── */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {(["chart", "grouped", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "chart"   && <GridIcon cls="h-3.5 w-3.5" />}
              {v === "grouped" && <ListIcon cls="h-3.5 w-3.5" />}
              {v === "table"   && <ListIcon cls="h-3.5 w-3.5" />}
              {v === "chart" ? "Distribution" : v === "grouped" ? "Grouped" : "Table"}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} of {submissions.length} entries
        </p>
      </div>

      {/* ── Chart view ── */}
      {view === "chart" && (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <p className="py-10 text-center text-sm italic text-muted-foreground">
              No question data available for this competition.
            </p>
          ) : (
            questions.map((q) => (
              <DistributionChart
                key={q.id}
                question={q}
                onSetCorrect={handleSetCorrect}
                settingFor={saving?.questionId === q.id ? (saving.option ?? "") : null}
              />
            ))
          )}
        </div>
      )}

      {/* ── Grouped view ── */}
      {view === "grouped" && (
        <GroupedView submissions={filtered} questions={questions} />
      )}

      {/* ── Table view ── */}
      {view === "table" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-[200px] flex-1">
              <SearchIcon cls="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="all">All Results</option>
                <option value="correct">Correct Only</option>
                <option value="wrong">Wrong Only</option>
                <option value="pending">Pending Only</option>
              </select>
              <ChevronIcon cls="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {(search || filter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilter("all") }}>
                Clear
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">User</TableHead>
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
                    <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                      {submissions.length === 0 ? "No predictions submitted yet." : "No entries match the filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sub) => {
                    const rowBg =
                      sub.resultDeclared && sub.allCorrect ? "bg-emerald-50/30 hover:bg-emerald-50/50"
                      : sub.resultDeclared && sub.anyWrong ? "bg-red-50/20 hover:bg-red-50/30"
                      : ""
                    return (
                      <TableRow key={sub.id} className={`group ${rowBg}`}>
                        {/* User */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              sub.resultDeclared && sub.allCorrect ? "bg-emerald-100 text-emerald-700"
                              : sub.resultDeclared && sub.anyWrong ? "bg-red-100 text-red-700"
                              : "bg-muted text-muted-foreground"
                            }`}>
                              {shortId(sub.userId).slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-mono text-[11px] font-semibold text-foreground">{shortId(sub.userId)}</p>
                              <p className="font-mono text-[10px] text-muted-foreground">{sub.userId.slice(0, 16)}…</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Selected option */}
                        <TableCell>
                          {sub.selectedOption ? (
                            <span className={`inline-block max-w-[160px] truncate rounded-lg border px-2.5 py-1 text-xs font-medium ${
                              sub.resultDeclared && sub.isCorrect === true  ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                              : sub.resultDeclared && sub.isCorrect === false ? "border-red-300 bg-red-100 text-red-800"
                              : "border-primary/20 bg-primary/5 text-primary"
                            }`} title={sub.selectedOption}>
                              {sub.selectedOption}
                            </span>
                          ) : (
                            <span className="text-xs italic text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Is correct */}
                        <TableCell>
                          <CorrectBadge isCorrect={sub.isCorrect} declared={sub.resultDeclared} />
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={`text-[10px] capitalize ${
                            sub.status === "active"       ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : sub.status === "disqualified" ? "border-red-200 bg-red-50 text-red-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
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

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {filtered.length} of {submissions.length} predictions
                </p>
                {questions.some((q) => q.resultDeclared) && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-emerald-600">{stats.correct} correct</span>
                    {" · "}
                    <span className="font-medium text-red-600">
                      {submissions.filter((s) => s.resultDeclared && s.anyWrong).length} wrong
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Detail modal ── */}
      <DetailModal sub={detailSub} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  )
}
