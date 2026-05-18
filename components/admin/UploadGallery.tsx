"use client"

/**
 * UploadGallery
 *
 * Admin gallery for upload-challenge submissions.
 * Fetches from GET /api/admin/competitions/upload-submissions,
 * renders a responsive grid of media cards, and lets admins
 * approve / reject / mark as winner each entry.
 *
 * Usage:
 *   <UploadGallery competitionId="uuid" title="Summer Glow Challenge" />
 */

import {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useRef,
} from "react"
import Image from "next/image"
import { Badge }   from "@/components/ui/badge"
import { Button }  from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video" | "unknown"
type SubmissionStatus = "active" | "approved" | "rejected" | "winner"

interface UploadEntry {
  id:            string
  userId:        string
  competitionId: string
  competition:   { id: string; title: string; slug: string } | null
  entryUrl:      string | null
  caption:       string | null
  mediaType:     MediaType
  status:        SubmissionStatus
  createdAt:     string
}

interface GalleryData {
  data:   UploadEntry[]
  meta:   { total: number; page: number; limit: number; totalPages: number }
  counts: Record<string, number>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; badgeClass: string; dot: string }
> = {
  active:   { label: "Pending",  badgeClass: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400"  },
  approved: { label: "Approved", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", badgeClass: "bg-red-50 text-red-700 border-red-200",           dot: "bg-red-500"    },
  winner:   { label: "Winner",   badgeClass: "bg-violet-50 text-violet-700 border-violet-200",  dot: "bg-violet-500" },
}

type FilterTab = "all" | SubmissionStatus

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "active",   label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "winner",   label: "Winners"  },
]

function shortId(userId: string) {
  return userId.split("-")[0].toUpperCase()
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  competitionId: string
  title?:        string
  initialStatus?: string
}

export function UploadGallery({ competitionId, title, initialStatus }: Props) {
  const [mounted,   setMounted]   = useState(false)
  const [data,      setData]      = useState<GalleryData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [filter,    setFilter]    = useState<FilterTab>(
    (initialStatus as FilterTab) ?? "all",
  )
  const [selected,  setSelected]  = useState<UploadEntry | null>(null)
  const [updating,  setUpdating]  = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  useEffect(() => setMounted(true), [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ competitionId, limit: "120" })
      if (filter !== "all") params.set("status", filter)
      const res = await fetch(`/api/admin/competitions/upload-submissions?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: GalleryData = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }, [competitionId, filter])

  useEffect(() => { load() }, [load])

  const updateStatus = useCallback(
    async (entryId: string, status: SubmissionStatus) => {
      setUpdating((s) => new Set(s).add(entryId))

      // Optimistic update
      startTransition(() => {
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            data: prev.data.map((e) => e.id === entryId ? { ...e, status } : e),
          }
        })
        if (selected?.id === entryId) setSelected((s) => s ? { ...s, status } : s)
      })

      try {
        const res = await fetch(`/api/admin/competitions/submissions/${entryId}/status`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } catch {
        // Roll back on failure
        load()
      } finally {
        setUpdating((s) => { const n = new Set(s); n.delete(entryId); return n })
      }
    },
    [load, selected],
  )

  if (!mounted) return <GallerySkeleton />

  const entries  = data?.data ?? []
  const counts   = data?.counts ?? {}
  const total    = data?.meta.total ?? 0

  const pending  = (counts["active"]   ?? 0)
  const approved = (counts["approved"] ?? 0)
  const rejected = (counts["rejected"] ?? 0)
  const winners  = (counts["winner"]   ?? 0)

  return (
    <div className="space-y-6">
      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Entries", value: total,    color: "text-foreground"  },
          { label: "Pending",       value: pending,  color: "text-amber-600"   },
          { label: "Approved",      value: approved, color: "text-emerald-600" },
          { label: "Winners",       value: winners,  color: "text-violet-600"  },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {FILTER_TABS.map((tab) => {
          const cnt =
            tab.key === "all"      ? total    :
            tab.key === "active"   ? pending  :
            tab.key === "approved" ? approved :
            tab.key === "rejected" ? rejected :
            winners
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
              <span className={[
                "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                filter === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              ].join(" ")}>
                {cnt}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <ErrorCard message={error} onRetry={load} />
      ) : entries.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <GalleryCard
              key={entry.id}
              entry={entry}
              busy={updating.has(entry.id)}
              onPreview={() => setSelected(entry)}
              onAction={updateStatus}
            />
          ))}
        </div>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {selected && (
        <PreviewModal
          entry={selected}
          busy={updating.has(selected.id)}
          onClose={() => setSelected(null)}
          onAction={updateStatus}
        />
      )}
    </div>
  )
}

// ─── Gallery Card ─────────────────────────────────────────────────────────────

function GalleryCard({
  entry,
  busy,
  onPreview,
  onAction,
}: {
  entry:     UploadEntry
  busy:      boolean
  onPreview: () => void
  onAction:  (id: string, status: SubmissionStatus) => void
}) {
  const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.active

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Media */}
      <button
        onClick={onPreview}
        className="relative block aspect-square w-full overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Preview entry"
      >
        {entry.entryUrl ? (
          entry.mediaType === "video" ? (
            <VideoThumb src={entry.entryUrl} />
          ) : (
            <Image
              src={entry.entryUrl}
              alt="Upload entry"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          )
        ) : (
          <NoMedia />
        )}

        {/* Status badge overlay */}
        <span
          className={[
            "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm",
            cfg.badgeClass,
          ].join(" ")}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        {/* Winner crown */}
        {entry.status === "winner" && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 shadow">
            <CrownIcon className="h-3.5 w-3.5 text-white" />
          </span>
        )}
      </button>

      {/* Card body */}
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-foreground">
            User {shortId(entry.userId)}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {fmtDate(entry.createdAt)}
          </span>
        </div>

        {entry.caption && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {entry.caption}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-1 pt-1">
          {entry.status !== "approved" && entry.status !== "winner" && (
            <ActionBtn
              onClick={() => onAction(entry.id, "approved")}
              disabled={busy}
              variant="approve"
            >
              Approve
            </ActionBtn>
          )}
          {entry.status !== "rejected" && (
            <ActionBtn
              onClick={() => onAction(entry.id, "rejected")}
              disabled={busy}
              variant="reject"
            >
              Reject
            </ActionBtn>
          )}
          {entry.status === "approved" && (
            <ActionBtn
              onClick={() => onAction(entry.id, "winner")}
              disabled={busy}
              variant="winner"
            >
              <CrownIcon className="h-3 w-3" />
              Winner
            </ActionBtn>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  entry,
  busy,
  onClose,
  onAction,
}: {
  entry:    UploadEntry
  busy:     boolean
  onClose:  () => void
  onAction: (id: string, status: SubmissionStatus) => void
}) {
  const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.active
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Submission Preview</span>
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                cfg.badgeClass,
              ].join(" ")}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-0 overflow-hidden md:flex-row">
          {/* Media pane */}
          <div className="relative flex min-h-64 flex-1 items-center justify-center bg-black/80">
            {entry.entryUrl ? (
              entry.mediaType === "video" ? (
                <video
                  src={entry.entryUrl}
                  controls
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <div className="relative h-full min-h-64 w-full">
                  <Image
                    src={entry.entryUrl}
                    alt="Upload entry"
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )
            ) : (
              <div className="flex h-64 items-center justify-center">
                <NoMedia large />
              </div>
            )}
          </div>

          {/* Details pane */}
          <div className="flex w-full flex-col justify-between border-t border-border bg-card md:w-72 md:border-l md:border-t-0">
            <div className="space-y-4 overflow-y-auto p-5">
              <Section title="User">
                <DetailRow label="ID"       value={entry.userId} mono />
                <DetailRow label="Short ID" value={`User ${shortId(entry.userId)}`} />
              </Section>

              <Divider />

              <Section title="Submission">
                <DetailRow label="Submitted" value={fmtDate(entry.createdAt)} />
                <DetailRow label="Media"     value={entry.mediaType} />
                {entry.competition && (
                  <DetailRow label="Challenge" value={entry.competition.title} />
                )}
                {entry.caption && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Caption
                    </p>
                    <p className="rounded-lg bg-muted/50 p-2 text-xs text-foreground">
                      {entry.caption}
                    </p>
                  </div>
                )}
              </Section>

              {entry.entryUrl && (
                <>
                  <Divider />
                  <a
                    href={entry.entryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Open original
                  </a>
                </>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex flex-col gap-2 border-t border-border p-4">
              {entry.status === "active" && (
                <button
                  disabled={busy}
                  onClick={() => onAction(entry.id, "approved")}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  Approve
                </button>
              )}
              {entry.status === "approved" && (
                <button
                  disabled={busy}
                  onClick={() => onAction(entry.id, "winner")}
                  className="flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-50"
                >
                  <CrownIcon className="h-4 w-4" />
                  Mark as Winner
                </button>
              )}
              {entry.status !== "rejected" && entry.status !== "winner" && (
                <button
                  disabled={busy}
                  onClick={() => onAction(entry.id, "rejected")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <XIcon className="h-4 w-4" />
                  Reject
                </button>
              )}
              {(entry.status === "rejected" || entry.status === "winner") && (
                <button
                  disabled={busy}
                  onClick={() => onAction(entry.id, "active")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  <ResetIcon className="h-4 w-4" />
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function ActionBtn({
  children,
  onClick,
  disabled,
  variant,
}: {
  children: React.ReactNode
  onClick:  () => void
  disabled: boolean
  variant:  "approve" | "reject" | "winner"
}) {
  const cls = {
    approve: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    reject:  "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    winner:  "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
  }[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition disabled:opacity-40",
        cls,
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function VideoThumb({ src }: { src: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black/60">
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
        <PlayIcon className="h-5 w-5 text-white" />
      </div>
    </div>
  )
}

function NoMedia({ large }: { large?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
      <ImageOffIcon className={large ? "h-12 w-12" : "h-8 w-8"} />
      {large && <p className="text-xs">No media</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className={["text-right text-[11px] font-medium text-foreground break-all", mono ? "font-mono text-[10px]" : ""].join(" ")}>
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-border" />
}

// ─── Loading / Error / Empty states ──────────────────────────────────────────

function GallerySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <GridSkeleton />
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">Failed to load gallery</p>
      <p className="mt-1 text-xs text-red-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-200"
      >
        Try again
      </button>
    </div>
  )
}

function EmptyState({ filter }: { filter: FilterTab }) {
  const labels: Record<FilterTab, string> = {
    all:      "No upload entries yet.",
    active:   "No pending entries.",
    approved: "No approved entries yet.",
    rejected: "No rejected entries.",
    winner:   "No winners selected yet.",
  }
  return (
    <div className="rounded-xl border border-border bg-card py-20 text-center">
      <ImageOffIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{labels[filter]}</p>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.219 2.4a1 1 0 0 1 1.562 0l2.35 2.937 3.37-1.517a1 1 0 0 1 1.367 1.236L17.5 12H6.5L4.132 5.056a1 1 0 0 1 1.367-1.236l3.37 1.517L11.22 2.4ZM5.5 14h13a1 1 0 0 1 0 2h-13a1 1 0 0 1 0-2Zm1 4h11a1 1 0 0 1 0 2h-11a1 1 0 0 1 0-2Z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function ImageOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 9 9l3.75 3.75L15 10.5l4.125 4.125M3.375 3.375h17.25M3.375 20.625h17.25M3.375 3.375 20.625 20.625" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
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
