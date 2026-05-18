"use client"

/**
 * WinnerSelectionPanel
 *
 * Self-contained winner selection widget for a single competition.
 * Supports both auto-selection (top-score / random, based on competition type)
 * and manual selection (checkbox list of submissions).
 *
 * State machine
 * ─────────────
 *   "locked"  — winners exist and are confirmed; read-only view
 *   "idle"    — no winners yet; selection mode visible
 *   "editing" — admin clicked "Re-select"; full editor shown
 *
 * API calls
 * ─────────
 *   GET  /api/admin/competitions/:id/winners         — load current winners
 *   GET  /api/admin/competitions/submissions?competitionId=... — load candidates
 *   POST /api/admin/competitions/:id/winners/select  — auto-select
 *   POST /api/admin/competitions/:id/winners/manual  — manual select
 *   DELETE /api/admin/competitions/:id/winners       — clear winners (re-open)
 *
 * Usage:
 *   <WinnerSelectionPanel
 *     competitionId="uuid"
 *     competitionType="quiz"   // "quiz" | "poll" | "prediction" | "upload"
 *     title="Week 3 Trivia"
 *   />
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
} from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type CompType = "quiz" | "poll" | "prediction" | "upload"
type SelectionMode = "auto" | "manual"
type PanelState = "loading" | "idle" | "editing" | "locked"

interface Winner {
  userId:          string
  userHandle:      string
  rank:            number
  score:           number
  selectionMethod: string
  selectedAt:      string
}

interface WinnersResponse {
  competitionId:   string
  competitionSlug: string
  selectionMethod: string
  winners:         Winner[]
}

interface Submission {
  id:        string
  userId:    string
  score:     number
  status:    string
  createdAt: string
  competition: { title: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_LABEL: Record<string, string> = {
  top_score: "Top Score",
  random:    "Random Draw",
  manual:    "Manual",
}

const autoMethodFor = (type: CompType) =>
  type === "quiz" || type === "prediction" ? "top_score" : "random"

const shortId = (id: string) => id.split("-")[0].toUpperCase()

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })

const RANK_MEDAL = ["🥇", "🥈", "🥉"]

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  competitionId:   string
  competitionType: CompType
  title?:          string
}

export function WinnerSelectionPanel({
  competitionId,
  competitionType,
  title,
}: Props) {
  // ── State ────────────────────────────────────────────────────────────────

  const [panelState,   setPanelState]   = useState<PanelState>("loading")
  const [winners,      setWinners]      = useState<Winner[]>([])
  const [submissions,  setSubmissions]  = useState<Submission[]>([])
  const [mode,         setMode]         = useState<SelectionMode>("auto")
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [winnerCount,  setWinnerCount]  = useState(3)
  const [search,       setSearch]       = useState("")
  const [error,        setError]        = useState<string | null>(null)
  const [saving,       setSaving]       = useState(false)
  const [clearing,     setClearing]     = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [, startTransition] = useTransition()

  // ── Load winners ─────────────────────────────────────────────────────────

  const loadWinners = useCallback(async () => {
    setPanelState("loading")
    setError(null)
    try {
      const res = await fetch(`/api/admin/competitions/${competitionId}/winners`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: WinnersResponse = await res.json()
      setWinners(data.winners ?? [])
      setPanelState(data.winners?.length ? "locked" : "idle")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
      setPanelState("idle")
    }
  }, [competitionId])

  useEffect(() => { loadWinners() }, [loadWinners])

  // ── Load submissions (for manual mode) ───────────────────────────────────

  const loadSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams({ competitionId, limit: "200" })
      const res = await fetch(`/api/admin/competitions/submissions?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSubmissions(data.data ?? [])
    } catch {
      // non-fatal; manual list will show empty
    }
  }, [competitionId])

  // Load submissions when entering manual mode
  useEffect(() => {
    if (mode === "manual" && (panelState === "idle" || panelState === "editing")) {
      loadSubmissions()
    }
  }, [mode, panelState, loadSubmissions])

  // ── Auto-select ───────────────────────────────────────────────────────────

  const handleAutoSelect = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/winners/select`,
        { method: "POST" },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: WinnersResponse = await res.json()
      setWinners(data.winners ?? [])
      setPanelState("locked")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auto-select failed")
    } finally {
      setSaving(false)
    }
  }, [competitionId])

  // ── Manual confirm ────────────────────────────────────────────────────────

  const handleManualConfirm = useCallback(async () => {
    if (selected.size === 0) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/winners/manual`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ userIds: [...selected] }),
        },
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `HTTP ${res.status}`)
      }
      const data: WinnersResponse = await res.json()
      setWinners(data.winners ?? [])
      setSelected(new Set())
      setPanelState("locked")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Manual confirm failed")
    } finally {
      setSaving(false)
    }
  }, [competitionId, selected])

  // ── Clear winners ─────────────────────────────────────────────────────────

  const handleClear = useCallback(async () => {
    setClearing(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/winners`,
        { method: "DELETE" },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setWinners([])
      setSelected(new Set())
      setConfirmClear(false)
      startTransition(() => setPanelState("editing"))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clear failed")
    } finally {
      setClearing(false)
    }
  }, [competitionId])

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredSubs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return submissions
      .filter((s) => s.status !== "disqualified")
      .filter((s) => !q || s.userId.toLowerCase().includes(q))
      .sort((a, b) => (b.score - a.score) || a.createdAt.localeCompare(b.createdAt))
  }, [submissions, search])

  const topCandidates = useMemo(() => {
    const eligible = submissions
      .filter((s) => s.status !== "disqualified")
      .sort((a, b) => (b.score - a.score) || a.createdAt.localeCompare(b.createdAt))
    return autoMethodFor(competitionType) === "top_score"
      ? eligible.slice(0, winnerCount)
      : eligible.slice(0, winnerCount) // placeholder; actual random done server-side
  }, [submissions, competitionType, winnerCount])

  const isEditable = panelState === "idle" || panelState === "editing"

  // ── Render ────────────────────────────────────────────────────────────────

  if (panelState === "loading") return <PanelSkeleton />

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* ── Panel header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <TrophyIcon className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="font-semibold text-foreground">Select Winners</h2>
            {title && (
              <p className="text-xs text-muted-foreground">{title}</p>
            )}
          </div>
        </div>

        {/* Lock / Re-select badge */}
        {panelState === "locked" && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <LockIcon className="h-3 w-3" />
              Confirmed
            </span>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                Re-select
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Clear winners?</span>
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {clearing ? "Clearing…" : "Yes, clear"}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Locked — winners display ──────────────────────────────────────── */}
      {panelState === "locked" && (
        <div className="p-5">
          <WinnersList winners={winners} />
        </div>
      )}

      {/* ── Editor ───────────────────────────────────────────────────────── */}
      {isEditable && (
        <div className="p-5 space-y-5">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
            {(["auto", "manual"] as SelectionMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {m === "auto" ? (
                  <><WandIcon className="h-3.5 w-3.5" /> Auto Select</>
                ) : (
                  <><ListChecksIcon className="h-3.5 w-3.5" /> Manual Select</>
                )}
              </button>
            ))}
          </div>

          {/* ── Auto mode ───────────────────────────────────────────────── */}
          {mode === "auto" && (
            <AutoPanel
              competitionType={competitionType}
              winnerCount={winnerCount}
              onCountChange={setWinnerCount}
              topCandidates={topCandidates}
              saving={saving}
              onConfirm={handleAutoSelect}
            />
          )}

          {/* ── Manual mode ─────────────────────────────────────────────── */}
          {mode === "manual" && (
            <ManualPanel
              submissions={filteredSubs}
              selected={selected}
              search={search}
              saving={saving}
              onSearchChange={setSearch}
              onToggle={(userId) => setSelected((prev) => {
                const next = new Set(prev)
                next.has(userId) ? next.delete(userId) : next.add(userId)
                return next
              })}
              onSelectAll={() => setSelected(new Set(filteredSubs.map((s) => s.userId)))}
              onClearAll={() => setSelected(new Set())}
              onConfirm={handleManualConfirm}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Winners list ─────────────────────────────────────────────────────────────

function WinnersList({ winners }: { winners: Winner[] }) {
  if (winners.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        No winners recorded yet.
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Confirmed Winners
      </p>
      <div className="space-y-2">
        {winners.map((w) => (
          <div
            key={w.userId}
            className={[
              "flex items-center gap-3 rounded-xl border px-4 py-3",
              w.rank === 1
                ? "border-amber-200 bg-amber-50/60"
                : w.rank === 2
                ? "border-slate-200 bg-slate-50/60"
                : w.rank === 3
                ? "border-orange-200 bg-orange-50/60"
                : "border-border bg-muted/20",
            ].join(" ")}
          >
            <span className="text-xl leading-none">
              {RANK_MEDAL[w.rank - 1] ?? `#${w.rank}`}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {w.userHandle}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {w.userId}
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              {w.score > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  Score {w.score}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                {METHOD_LABEL[w.selectionMethod] ?? w.selectionMethod}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-right text-[10px] text-muted-foreground">
        {winners.length} winner{winners.length !== 1 ? "s" : ""} confirmed
      </p>
    </div>
  )
}

// ─── Auto panel ───────────────────────────────────────────────────────────────

function AutoPanel({
  competitionType,
  winnerCount,
  onCountChange,
  topCandidates,
  saving,
  onConfirm,
}: {
  competitionType: CompType
  winnerCount:     number
  onCountChange:   (n: number) => void
  topCandidates:   Submission[]
  saving:          boolean
  onConfirm:       () => void
}) {
  const method = autoMethodFor(competitionType)

  return (
    <div className="space-y-4">
      {/* Method info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        {method === "top_score" ? (
          <StarIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        ) : (
          <ShuffleIcon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {method === "top_score" ? "Top Score Selection" : "Random Draw"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {method === "top_score"
              ? "Winners are ranked by highest score. Ties broken by earliest submission time."
              : "Winners are chosen randomly from all eligible, non-disqualified submissions using PostgreSQL RANDOM()."}
          </p>
        </div>
      </div>

      {/* Winner count */}
      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Number of Winners</p>
          <p className="text-xs text-muted-foreground">How many winners to select</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCountChange(Math.max(1, winnerCount - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-bold tabular-nums text-foreground">
            {winnerCount}
          </span>
          <button
            onClick={() => onCountChange(Math.min(20, winnerCount + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preview top candidates */}
      {topCandidates.length > 0 && method === "top_score" && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preview — Current Top {winnerCount}
          </p>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {topCandidates.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 bg-card px-4 py-2.5">
                <span className="w-5 text-center text-base leading-none">
                  {RANK_MEDAL[i] ?? <span className="text-xs text-muted-foreground">#{i + 1}</span>}
                </span>
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
            Preview is based on current data. Actual auto-selection runs on the server.
          </p>
        </div>
      )}

      {method === "random" && (
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          {topCandidates.length} eligible submission{topCandidates.length !== 1 ? "s" : ""} in the pool.
          {winnerCount} will be selected at random when you confirm.
        </div>
      )}

      <ConfirmButton saving={saving} disabled={saving} onClick={onConfirm}>
        Confirm Winners
      </ConfirmButton>
    </div>
  )
}

// ─── Manual panel ─────────────────────────────────────────────────────────────

function ManualPanel({
  submissions,
  selected,
  search,
  saving,
  onSearchChange,
  onToggle,
  onSelectAll,
  onClearAll,
  onConfirm,
}: {
  submissions:    Submission[]
  selected:       Set<string>
  search:         string
  saving:         boolean
  onSearchChange: (v: string) => void
  onToggle:       (userId: string) => void
  onSelectAll:    () => void
  onClearAll:     () => void
  onConfirm:      () => void
}) {
  return (
    <div className="space-y-4">
      {/* Search + bulk controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by user ID…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

      {/* Selection count badge */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5">
          <TrophyIcon className="h-4 w-4 text-violet-500" />
          <p className="text-sm font-semibold text-violet-700">
            {selected.size} winner{selected.size !== 1 ? "s" : ""} selected
          </p>
          <p className="text-xs text-violet-500">— order of selection = rank order</p>
        </div>
      )}

      {/* Submission list */}
      {submissions.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
          No eligible submissions found.
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {submissions.map((s, i) => {
            const checked = selected.has(s.userId)
            const rank    = checked ? [...selected].indexOf(s.userId) + 1 : null

            return (
              <label
                key={s.id}
                className={[
                  "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                  checked ? "bg-violet-50/60" : "bg-card hover:bg-muted/30",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(s.userId)}
                  className="h-4 w-4 rounded border-border accent-violet-600 cursor-pointer"
                />

                {/* Rank indicator */}
                <span className="w-6 text-center text-base leading-none">
                  {rank != null
                    ? (RANK_MEDAL[rank - 1] ?? <span className="text-xs font-bold text-violet-600">#{rank}</span>)
                    : <span className="text-xs text-muted-foreground">{i + 1}</span>}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    User {shortId(s.userId)}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                    {s.userId}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  {s.score > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {s.score}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{fmtDate(s.createdAt)}</span>
                </div>
              </label>
            )
          })}
        </div>
      )}

      <ConfirmButton
        saving={saving}
        disabled={saving || selected.size === 0}
        onClick={onConfirm}
      >
        Confirm {selected.size > 0 ? `${selected.size} ` : ""}Winner{selected.size !== 1 ? "s" : ""}
      </ConfirmButton>
    </div>
  )
}

// ─── Confirm button ───────────────────────────────────────────────────────────

function ConfirmButton({
  children,
  disabled,
  saving,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  saving:   boolean
  onClick:  () => void
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving ? (
        <><SpinnerIcon className="h-4 w-4 animate-spin" /> Confirming…</>
      ) : (
        <><TrophyIcon className="h-4 w-4" />{children}</>
      )}
    </button>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-10 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
      </div>
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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

function ListChecksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 9 3 3 5.25-6M3.75 15l3 3 5.25-6M13.5 9h7.5M13.5 15h7.5" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
    </svg>
  )
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
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

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
