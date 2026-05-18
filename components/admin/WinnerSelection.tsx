"use client"

/**
 * WinnerSelection
 *
 * Embeddable winner-selection widget. Drop it anywhere with a competitionId
 * and an optional onSelect callback — it handles the rest.
 *
 * Two modes
 * ─────────
 *  auto   — server picks top-N by score (quiz/prediction) or random (poll/upload)
 *  manual — admin checks submissions from the scrollable list; order = rank order
 *
 * API (single endpoint, admin proxy injects X-Admin-Key)
 * ──────────────────────────────────────────────────────
 *  POST /api/admin/competitions/:id/winners
 *    auto:   { mode: "auto",   count: number }
 *    manual: { mode: "manual", userIds: string[] }
 *
 *  GET  /api/admin/competitions/submissions?competitionId=...   (candidates)
 *
 * Usage
 * ─────
 *  <WinnerSelection
 *    competitionId="uuid"
 *    competitionType="quiz"
 *    onSelect={(winners) => console.log(winners)}
 *  />
 */

import { useState, useEffect, useCallback, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompetitionType = "quiz" | "poll" | "prediction" | "upload"
type Mode = "auto" | "manual"

export interface Winner {
  userId:          string
  userHandle:      string
  rank:            number
  score:           number
  selectionMethod: string
  selectedAt:      string
}

interface Submission {
  id:        string
  userId:    string
  score:     number
  status:    string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shortId = (id: string) => `${id.split("-")[0].toUpperCase()}`
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

/** Quiz / prediction → ranked by score; everything else → random draw */
const defaultMethod = (type: CompetitionType) =>
  type === "quiz" || type === "prediction" ? "top_score" : "random"

const MEDALS = ["🥇", "🥈", "🥉"]
const medal  = (rank: number) => MEDALS[rank - 1] ?? `#${rank}`

// ─── Component ────────────────────────────────────────────────────────────────

export interface WinnerSelectionProps {
  competitionId:   string
  competitionType: CompetitionType
  /** Called after winners are successfully confirmed */
  onSelect?:       (winners: Winner[]) => void
}

export function WinnerSelection({
  competitionId,
  competitionType,
  onSelect,
}: WinnerSelectionProps) {
  // ── UI state ────────────────────────────────────────────────────────────
  const [mode,    setMode]    = useState<Mode>("auto")
  const [count,   setCount]   = useState(3)
  const [search,  setSearch]  = useState("")

  // ── Data state ──────────────────────────────────────────────────────────
  const [candidates, setCandidates] = useState<Submission[]>([])
  const [loadingC,   setLoadingC]   = useState(false)

  const [selected,  setSelected]  = useState<string[]>([])   // ordered userIds

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [winners,    setWinners]    = useState<Winner[] | null>(null)  // confirmed result

  // ── Load candidates ──────────────────────────────────────────────────────
  const loadCandidates = useCallback(async () => {
    setLoadingC(true)
    try {
      const p   = new URLSearchParams({ competitionId, limit: "200" })
      const res = await fetch(`/api/admin/competitions/submissions?${p}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const rows: Submission[] = (data.data ?? []).filter(
        (s: Submission) => s.status !== "disqualified",
      )
      setCandidates(rows)
    } catch {
      // non-fatal: empty list shown
    } finally {
      setLoadingC(false)
    }
  }, [competitionId])

  useEffect(() => { loadCandidates() }, [loadCandidates])

  // ── Filtered / sorted candidate list ────────────────────────────────────
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidates
      .filter((s) => !q || s.userId.toLowerCase().includes(q))
      .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
  }, [candidates, search])

  // ── Toggle selection (preserves order for ranking) ───────────────────────
  const toggle = useCallback((userId: string) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    )
  }, [])

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (mode === "manual" && selected.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const body =
        mode === "auto"
          ? { mode: "auto", count }
          : { mode: "manual", userIds: selected }

      const res = await fetch(
        `/api/admin/competitions/${competitionId}/winners`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        },
      )

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(
          Array.isArray(j.message) ? j.message.join("; ") : (j.message ?? `HTTP ${res.status}`),
        )
      }

      const data = await res.json()
      const confirmed: Winner[] = data.winners ?? []
      setWinners(confirmed)
      onSelect?.(confirmed)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }, [competitionId, mode, count, selected, onSelect])

  // ── Reset to pick again ──────────────────────────────────────────────────
  const reset = () => {
    setWinners(null)
    setSelected([])
    setError(null)
  }

  // ── Confirmed result view ────────────────────────────────────────────────
  if (winners !== null) {
    return <ConfirmedView winners={winners} onReset={reset} />
  }

  // ── Selection view ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <ModeToggle mode={mode} onChange={setMode} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {mode === "auto" ? (
        <AutoView
          competitionType={competitionType}
          count={count}
          onCountChange={setCount}
          totalCandidates={candidates.length}
          topPreview={visible.slice(0, count)}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <ManualView
          submissions={visible}
          loading={loadingC}
          selected={selected}
          search={search}
          submitting={submitting}
          onSearch={setSearch}
          onToggle={toggle}
          onSelectAll={() => setSelected(visible.map((s) => s.userId))}
          onClearAll={() => setSelected([])}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

// ─── Mode Toggle ─────────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
      {(["auto", "manual"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
            mode === m
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {m === "auto" ? (
            <><WandIcon className="h-3.5 w-3.5" />Auto — Top Score</>
          ) : (
            <><ChecklistIcon className="h-3.5 w-3.5" />Manual Pick</>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Auto View ────────────────────────────────────────────────────────────────

function AutoView({
  competitionType,
  count,
  onCountChange,
  totalCandidates,
  topPreview,
  submitting,
  onSubmit,
}: {
  competitionType:  CompetitionType
  count:            number
  onCountChange:    (n: number) => void
  totalCandidates:  number
  topPreview:       Submission[]
  submitting:       boolean
  onSubmit:         () => void
}) {
  const method = defaultMethod(competitionType)

  return (
    <div className="space-y-4">
      {/* Method pill */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <span className="mt-0.5 text-lg leading-none">
          {method === "top_score" ? "🏅" : "🎲"}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {method === "top_score" ? "Top Score Selection" : "Random Draw"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {method === "top_score"
              ? "Ranks by highest score, earliest submission breaks ties."
              : `Picks randomly from ${totalCandidates} eligible submission${totalCandidates !== 1 ? "s" : ""}.`}
          </p>
        </div>
      </div>

      {/* Winner count stepper */}
      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Winners to select</p>
          <p className="text-xs text-muted-foreground">How many spots to fill</p>
        </div>
        <div className="flex items-center gap-2.5">
          <StepBtn icon="-" onClick={() => onCountChange(Math.max(1, count - 1))} />
          <span className="w-7 text-center text-base font-bold tabular-nums text-foreground">
            {count}
          </span>
          <StepBtn icon="+" onClick={() => onCountChange(Math.min(20, count + 1))} />
        </div>
      </div>

      {/* Top-N preview (scored types only) */}
      {method === "top_score" && topPreview.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current Top {count}
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {topPreview.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 bg-card px-4 py-2.5">
                <span className="w-5 text-center text-base leading-none">{medal(i + 1)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    User {shortId(s.userId)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{fmtDate(s.createdAt)}</p>
                </div>
                {s.score > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {s.score}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Preview only — final selection runs on the server.
          </p>
        </div>
      )}

      <SubmitButton submitting={submitting} disabled={submitting} onClick={onSubmit}>
        Confirm Winners
      </SubmitButton>
    </div>
  )
}

// ─── Manual View ──────────────────────────────────────────────────────────────

function ManualView({
  submissions,
  loading,
  selected,
  search,
  submitting,
  onSearch,
  onToggle,
  onSelectAll,
  onClearAll,
  onSubmit,
}: {
  submissions: Submission[]
  loading:     boolean
  selected:    string[]
  search:      string
  submitting:  boolean
  onSearch:    (v: string) => void
  onToggle:    (userId: string) => void
  onSelectAll: () => void
  onClearAll:  () => void
  onSubmit:    () => void
}) {
  return (
    <div className="space-y-3">
      {/* Search bar + bulk buttons */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by user ID…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={onSelectAll}
          className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          All
        </button>
        <button
          onClick={onClearAll}
          className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          None
        </button>
      </div>

      {/* Selection count pill */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <TrophyIcon className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">
            {selected.length} winner{selected.length !== 1 ? "s" : ""} selected
          </span>
          <span className="text-xs text-amber-600">— selection order = rank 1, 2, 3…</span>
        </div>
      )}

      {/* Scrollable submission list */}
      {loading ? (
        <ListSkeleton />
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-border py-10 text-center text-sm text-muted-foreground">
          No eligible submissions found.
        </div>
      ) : (
        <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {submissions.map((s) => {
            const isChecked = selected.includes(s.userId)
            const rank      = isChecked ? selected.indexOf(s.userId) + 1 : null

            return (
              <li key={s.id}>
                <label
                  className={[
                    "flex cursor-pointer select-none items-center gap-3 px-4 py-3 transition-colors",
                    isChecked ? "bg-amber-50/70" : "bg-card hover:bg-muted/30",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(s.userId)}
                    className="h-4 w-4 rounded border-border accent-amber-500"
                  />

                  {/* Rank / position indicator */}
                  <span className="w-6 shrink-0 text-center text-base leading-none">
                    {rank != null ? medal(rank) : <span className="text-xs text-muted-foreground/50">·</span>}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      User {shortId(s.userId)}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      {s.userId}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    {s.score > 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {s.score}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {fmtDate(s.createdAt)}
                    </span>
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      )}

      <SubmitButton
        submitting={submitting}
        disabled={submitting || selected.length === 0}
        onClick={onSubmit}
      >
        Confirm {selected.length > 0 ? `${selected.length} ` : ""}Winner{selected.length !== 1 ? "s" : ""}
      </SubmitButton>
    </div>
  )
}

// ─── Confirmed result view ────────────────────────────────────────────────────

function ConfirmedView({
  winners,
  onReset,
}: {
  winners: Winner[]
  onReset: () => void
}) {
  return (
    <div className="space-y-3">
      {/* Success banner */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Winners confirmed!</p>
          <p className="text-xs text-emerald-600">
            {winners.length} winner{winners.length !== 1 ? "s" : ""} saved successfully.
          </p>
        </div>
      </div>

      {/* Winner rows */}
      <div className="space-y-2">
        {winners.map((w) => (
          <div
            key={w.userId}
            className={[
              "flex items-center gap-3 rounded-xl border px-4 py-3",
              w.rank === 1
                ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
                : w.rank === 2
                ? "border-slate-200 bg-slate-50"
                : w.rank === 3
                ? "border-orange-200 bg-orange-50"
                : "border-border bg-muted/20",
            ].join(" ")}
          >
            <span className="text-2xl leading-none">{medal(w.rank)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {w.userHandle}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground truncate">
                {w.userId}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {w.score > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  Score {w.score}
                </span>
              )}
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                {w.selectionMethod.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Re-select link */}
      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
      >
        <ResetIcon className="h-3.5 w-3.5" />
        Change selection
      </button>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function StepBtn({ icon, onClick }: { icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-lg font-bold text-muted-foreground hover:bg-muted"
    >
      {icon}
    </button>
  )
}

function SubmitButton({
  children,
  disabled,
  submitting,
  onClick,
}: {
  children:   React.ReactNode
  disabled:   boolean
  submitting: boolean
  onClick:    () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {submitting ? (
        <><SpinnerIcon className="h-4 w-4 animate-spin" />Confirming…</>
      ) : (
        <><TrophyIcon className="h-4 w-4" />{children}</>
      )}
    </button>
  )
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  )
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 9 3 3 5.25-6M3.75 15l3 3 5.25-6M13.5 9h7.5M13.5 15h7.5" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
