"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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

// ----- Types ----- //

export type SubmissionStatus = "active" | "disqualified" | "winner"
export type CompetitionType = "quiz" | "poll" | "prediction" | "upload"

export interface AdminSubmission {
  id: string
  userId: string
  competitionId: string
  competition: {
    id: string
    title: string
    slug: string
    type: CompetitionType
  } | null
  answers: Record<string, string>
  score: number
  status: SubmissionStatus
  createdAt: string
}

export interface SubmissionStats {
  totalSubmissions: number
  uniqueParticipants: number
  avgScore: number | null
}

// ----- Constants ----- //

const TYPE_LABELS: Record<CompetitionType, string> = {
  quiz: "Quiz", poll: "Poll", prediction: "Prediction", upload: "Upload",
}

const TYPE_BADGE: Record<CompetitionType, string> = {
  quiz:       "border-amber-200 bg-amber-50 text-amber-700",
  poll:       "border-sky-200 bg-sky-50 text-sky-700",
  prediction: "border-purple-200 bg-purple-50 text-purple-700",
  upload:     "border-rose-200 bg-rose-50 text-rose-700",
}

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  active:       "border-emerald-200 bg-emerald-50 text-emerald-700",
  disqualified: "border-red-200 bg-red-50 text-red-700",
  winner:       "border-amber-200 bg-amber-50 text-amber-700",
}

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  active: "Active", disqualified: "Disqualified", winner: "Winner",
}

// ----- Helpers ----- //

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function conversionRate(total: number, unique: number) {
  if (!unique || !total) return "—"
  return `${Math.round((total / unique) * 100)}%`
}

// ----- Icons ----- //

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
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
function BanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  )
}
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}
function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

// ----- Stat Card ----- //

function StatCard({ label, value, sub, accent }: {
  label: string
  value: string | number
  sub?: string
  accent?: string
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

// ----- Detail Modal ----- //

function SubmissionDetailModal({
  submission,
  open,
  onClose,
}: {
  submission: AdminSubmission | null
  open: boolean
  onClose: () => void
}) {
  if (!submission) return null

  const type = submission.competition?.type ?? "quiz"
  const isUpload = type === "upload"
  const entryUrl = submission.answers?.entry_url ?? null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogDescription>
            ID: {shortId(submission.id)} &nbsp;·&nbsp; {formatDate(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1 text-sm">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="mt-0.5 font-mono text-xs text-foreground/80 break-all">{submission.userId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Competition</p>
              <p className="mt-0.5 font-medium text-foreground">{submission.competition?.title ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <Badge variant="outline" className={`mt-0.5 text-[10px] ${TYPE_BADGE[type as CompetitionType]}`}>
                {TYPE_LABELS[type as CompetitionType] ?? type}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className={`mt-0.5 text-[10px] ${STATUS_BADGE[submission.status]}`}>
                {STATUS_LABELS[submission.status]}
              </Badge>
            </div>
            {type === "quiz" && (
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="mt-0.5 font-bold text-foreground">{submission.score}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Answers / Entry */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {isUpload ? "Uploaded Entry" : "Answers"}
            </p>

            {isUpload && entryUrl ? (
              <div className="space-y-2">
                {/\.(mp4|webm|mov)$/i.test(entryUrl) ? (
                  <video src={entryUrl} controls className="w-full rounded-lg" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entryUrl} alt="Entry" className="w-full rounded-lg object-cover" />
                )}
                <a
                  href={entryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Open in new tab ↗
                </a>
              </div>
            ) : Object.keys(submission.answers).length > 0 ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                {Object.entries(submission.answers).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[11px] text-muted-foreground break-all">{k.slice(0, 8)}…</span>
                    <span className="text-right text-xs text-foreground/80">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No answers recorded.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ----- SubmissionsTable ----- //

export function SubmissionsTable({
  initialSubmissions,
  initialStats,
  competitions,
}: {
  initialSubmissions: AdminSubmission[]
  initialStats: SubmissionStats
  competitions: CompetitionOption[]
}) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [stats, setStats] = useState(initialStats)

  // Filters
  const [search, setSearch]                   = useState("")
  const [filterCompetition, setFilterComp]    = useState("all")
  const [filterType, setFilterType]           = useState("all")
  const [filterStatus, setFilterStatus]       = useState("all")
  const [filterDateFrom, setFilterDateFrom]   = useState("")
  const [filterDateTo, setFilterDateTo]       = useState("")

  // UI state
  const [detailSub, setDetailSub]             = useState<AdminSubmission | null>(null)
  const [detailOpen, setDetailOpen]           = useState(false)
  const [updatingIds, setUpdatingIds]         = useState<Set<string>>(new Set())
  const [errorIds, setErrorIds]               = useState<Set<string>>(new Set())

  // ----- Filtered rows -----
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filterCompetition !== "all" && s.competitionId !== filterCompetition) return false
      if (filterType !== "all" && s.competition?.type !== filterType) return false
      if (filterStatus !== "all" && s.status !== filterStatus) return false
      if (filterDateFrom && new Date(s.createdAt) < new Date(filterDateFrom)) return false
      if (filterDateTo   && new Date(s.createdAt) > new Date(filterDateTo + "T23:59:59")) return false
      if (search) {
        const q = search.toLowerCase()
        const matchesUser  = s.userId.toLowerCase().includes(q)
        const matchesComp  = s.competition?.title.toLowerCase().includes(q) ?? false
        const matchesId    = s.id.toLowerCase().includes(q)
        if (!matchesUser && !matchesComp && !matchesId) return false
      }
      return true
    })
  }, [submissions, search, filterCompetition, filterType, filterStatus, filterDateFrom, filterDateTo])

  // ----- Derived stats from filtered rows -----
  const derivedStats = useMemo(() => {
    const total   = filtered.length
    const unique  = new Set(filtered.map((s) => s.userId)).size
    const quizSubs = filtered.filter((s) => s.competition?.type === "quiz" && s.score > 0)
    const avg = quizSubs.length
      ? parseFloat((quizSubs.reduce((acc, s) => acc + s.score, 0) / quizSubs.length).toFixed(1))
      : null
    return { total, unique, avg }
  }, [filtered])

  // ----- Update status -----
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

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card" />
          ))}
        </div>
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
          sub={filterCompetition !== "all" || filterType !== "all" || filterStatus !== "all" || search ? "filtered" : "all time"}
        />
        <StatCard
          label="Unique Participants"
          value={derivedStats.unique.toLocaleString()}
          sub="distinct users"
        />
        <StatCard
          label="Avg Score"
          value={derivedStats.avg !== null ? derivedStats.avg : "—"}
          sub="quiz submissions only"
          accent={derivedStats.avg !== null ? "text-primary" : undefined}
        />
        <StatCard
          label="Conversion Rate"
          value={conversionRate(derivedStats.total, derivedStats.unique)}
          sub="submissions / participants"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user ID or competition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Competition */}
        <div className="relative">
          <select
            value={filterCompetition}
            onChange={(e) => setFilterComp(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Competitions</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Type */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="poll">Poll</option>
            <option value="prediction">Prediction</option>
            <option value="upload">Upload</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Status */}
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

        {/* Date range */}
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          title="Date from"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          title="Date to"
        />

        {/* Clear */}
        {(search || filterCompetition !== "all" || filterType !== "all" || filterStatus !== "all" || filterDateFrom || filterDateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch(""); setFilterComp("all"); setFilterType("all")
              setFilterStatus("all"); setFilterDateFrom(""); setFilterDateTo("")
            }}
          >
            Clear filters
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
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Submitted</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                  No submissions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => {
                const type    = sub.competition?.type ?? "quiz"
                const isQuiz  = type === "quiz"
                const busy    = updatingIds.has(sub.id)
                const hasErr  = errorIds.has(sub.id)

                return (
                  <TableRow key={sub.id} className="group">
                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {shortId(sub.userId).slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-mono text-[11px] font-medium text-foreground">
                            {shortId(sub.userId)}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {sub.userId.slice(0, 18)}…
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Competition */}
                    <TableCell>
                      <p className="max-w-[180px] truncate text-sm font-medium text-foreground">
                        {sub.competition?.title ?? "—"}
                      </p>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${TYPE_BADGE[type as CompetitionType]}`}>
                        {TYPE_LABELS[type as CompetitionType] ?? type}
                      </Badge>
                    </TableCell>

                    {/* Score */}
                    <TableCell>
                      {isQuiz ? (
                        <span className="font-mono text-sm font-bold text-foreground">
                          {sub.score}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(sub.createdAt)}
                      </span>
                    </TableCell>

                    {/* Status toggle */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_BADGE[sub.status]}`}
                        >
                          {STATUS_LABELS[sub.status]}
                        </Badge>
                        {hasErr && (
                          <span className="text-[10px] text-destructive">Failed</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
                            <EyeIcon className="h-4 w-4" />
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
                              <CheckCircleIcon className="h-4 w-4" />
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

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-border bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
              <span className="font-medium text-foreground">{submissions.length}</span> submissions
            </p>
          </div>
        )}
      </div>

      <SubmissionDetailModal
        submission={detailSub}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
