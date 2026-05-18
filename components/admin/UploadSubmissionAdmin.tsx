"use client"

/**
 * UploadSubmissionAdmin
 *
 * Self-contained gallery widget for managing upload-challenge submissions for
 * a single competition. Drop it anywhere with just a competitionId prop.
 *
 * Features
 * ─────────
 * • Fetches entries from GET /api/admin/competitions/upload-submissions
 * • 3-column responsive grid with image / video previews
 * • Per-card status badge + Approve / Reject toggle + Mark as Winner button
 * • Filter tabs: All / Pending / Approved / Rejected / Winners
 * • Full-preview modal: media, user details, caption, contextual actions
 * • Optimistic status updates with automatic rollback on failure
 *
 * Status lifecycle (stored as `status` on the Submission entity):
 *   active   → Pending    (newly submitted, awaiting review)
 *   approved → Approved   (admin approved)
 *   rejected → Rejected   (admin rejected)
 *   winner   → Winner     (manually marked as winner)
 *
 * Usage:
 *   <UploadSubmissionAdmin competitionId="uuid" title="Summer Glow Challenge" />
 */

import { useState, useEffect, useCallback, useTransition, useRef } from "react"
import Image from "next/image"

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaType      = "image" | "video" | "unknown"
type EntryStatus    = "active" | "approved" | "rejected" | "winner"
type FilterTab      = "all" | EntryStatus

interface UploadEntry {
  id:            string
  userId:        string
  competitionId: string
  entryUrl:      string | null
  caption:       string | null
  mediaType:     MediaType
  status:        EntryStatus
  createdAt:     string
}

interface FetchResult {
  data:   UploadEntry[]
  meta:   { total: number; page: number; limit: number; totalPages: number }
  counts: Record<string, number>
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<EntryStatus, { label: string; badge: string; dot: string; ring: string }> = {
  active:   { label: "Pending",  badge: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400",    ring: "ring-amber-300"   },
  approved: { label: "Approved", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", ring: "ring-emerald-400"  },
  rejected: { label: "Rejected", badge: "bg-red-50 text-red-700 border-red-200",            dot: "bg-red-500",     ring: "ring-red-400"     },
  winner:   { label: "Winner",   badge: "bg-violet-50 text-violet-700 border-violet-200",   dot: "bg-violet-500",  ring: "ring-violet-400"  },
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "active",   label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "winner",   label: "Winners"  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shortId  = (id: string) => id.split("-")[0].toUpperCase()
const fmtDate  = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  competitionId: string
  title?:        string
}

export function UploadSubmissionAdmin({ competitionId, title }: Props) {
  const [mounted,  setMounted]  = useState(false)
  const [result,   setResult]   = useState<FetchResult | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [tab,      setTab]      = useState<FilterTab>("all")
  const [preview,  setPreview]  = useState<UploadEntry | null>(null)
  const [busy,     setBusy]     = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  useEffect(() => setMounted(true), [])

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ competitionId, limit: "200" })
      if (tab !== "all") params.set("status", tab)
      const res  = await fetch(`/api/admin/competitions/upload-submissions?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [competitionId, tab])

  useEffect(() => { load() }, [load])

  // ── Status update ──────────────────────────────────────────────────────────

  const setStatus = useCallback(
    async (id: string, status: EntryStatus) => {
      setBusy((s) => new Set(s).add(id))

      // Optimistic
      startTransition(() => {
        setResult((prev) =>
          prev ? {
            ...prev,
            data: prev.data.map((e) => (e.id === id ? { ...e, status } : e)),
          } : prev,
        )
        setPreview((p) => (p?.id === id ? { ...p, status } : p))
      })

      try {
        const res = await fetch(`/api/admin/competitions/submissions/${id}/status`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error()
      } catch {
        load() // rollback
      } finally {
        setBusy((s) => { const n = new Set(s); n.delete(id); return n })
      }
    },
    [load],
  )

  // ── Derived ────────────────────────────────────────────────────────────────

  if (!mounted) return <Skeleton />

  const entries  = result?.data   ?? []
  const counts   = result?.counts ?? {}
  const total    = (counts["active"] ?? 0) + (counts["approved"] ?? 0) +
                   (counts["rejected"] ?? 0) + (counts["winner"] ?? 0)

  const tabCount = (t: FilterTab) =>
    t === "all"      ? total                   :
    t === "active"   ? (counts["active"]   ?? 0) :
    t === "approved" ? (counts["approved"] ?? 0) :
    t === "rejected" ? (counts["rejected"] ?? 0) :
                       (counts["winner"]   ?? 0)

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {title ?? "Upload Entries"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {total} entr{total === 1 ? "y" : "ies"} submitted
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          {(["active", "approved", "winner"] as EntryStatus[]).map((s) => {
            const cfg = STATUS_CFG[s]
            const n   = counts[s] ?? 0
            return (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}: {n}
              </span>
            )
          })}
        </div>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
            <span
              className={[
                "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                tab === t.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {tabCount(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <ErrorCard message={error} onRetry={load} />
      ) : entries.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              busy={busy.has(entry.id)}
              onPreview={() => setPreview(entry)}
              onSetStatus={setStatus}
            />
          ))}
        </div>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {preview && (
        <PreviewModal
          entry={preview}
          busy={busy.has(preview.id)}
          onClose={() => setPreview(null)}
          onSetStatus={setStatus}
        />
      )}
    </div>
  )
}

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  busy,
  onPreview,
  onSetStatus,
}: {
  entry:       UploadEntry
  busy:        boolean
  onPreview:   () => void
  onSetStatus: (id: string, s: EntryStatus) => void
}) {
  const cfg = STATUS_CFG[entry.status]

  return (
    <div
      className={[
        "group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md",
        entry.status === "approved" ? "border-emerald-200" :
        entry.status === "winner"   ? "border-violet-300"  :
        entry.status === "rejected" ? "border-red-200 opacity-60" :
        "border-border",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <button
        onClick={onPreview}
        className="relative block aspect-square w-full overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open preview"
      >
        {entry.entryUrl ? (
          entry.mediaType === "video" ? (
            <VideoThumb src={entry.entryUrl} />
          ) : (
            <Image
              src={entry.entryUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
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
            cfg.badge,
          ].join(" ")}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        {entry.status === "winner" && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 shadow-sm">
            <CrownIcon className="h-3.5 w-3.5 text-white" />
          </span>
        )}
      </button>

      {/* Card body */}
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-1">
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

        {/* Actions */}
        <div className="flex gap-1 pt-0.5">
          {/* Approve toggle */}
          {entry.status === "active" && (
            <Btn
              variant="approve"
              disabled={busy}
              onClick={() => onSetStatus(entry.id, "approved")}
            >
              <CheckIcon className="h-3 w-3" />
              Approve
            </Btn>
          )}
          {entry.status === "approved" && (
            <Btn
              variant="undo"
              disabled={busy}
              onClick={() => onSetStatus(entry.id, "active")}
            >
              <UndoIcon className="h-3 w-3" />
              Undo
            </Btn>
          )}

          {/* Reject toggle */}
          {entry.status !== "rejected" && entry.status !== "winner" && (
            <Btn
              variant="reject"
              disabled={busy}
              onClick={() => onSetStatus(entry.id, "rejected")}
            >
              <XIcon className="h-3 w-3" />
              Reject
            </Btn>
          )}
          {entry.status === "rejected" && (
            <Btn
              variant="undo"
              disabled={busy}
              onClick={() => onSetStatus(entry.id, "active")}
            >
              <UndoIcon className="h-3 w-3" />
              Restore
            </Btn>
          )}

          {/* Mark winner */}
          {entry.status === "approved" && (
            <Btn
              variant="winner"
              disabled={busy}
              onClick={() => onSetStatus(entry.id, "winner")}
            >
              <CrownIcon className="h-3 w-3" />
            </Btn>
          )}
          {entry.status === "winner" && (
            <Btn
              variant="undo"
              disabled={busy}
              onClick={() => onSetStatus(entry.id, "approved")}
            >
              <UndoIcon className="h-3 w-3" />
              Unmark
            </Btn>
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
  onSetStatus,
}: {
  entry:       UploadEntry
  busy:        boolean
  onClose:     () => void
  onSetStatus: (id: string, s: EntryStatus) => void
}) {
  const cfg        = STATUS_CFG[entry.status]
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Entry Preview</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Media */}
          <div className="relative flex min-h-56 flex-1 items-center justify-center bg-black/80">
            {entry.entryUrl ? (
              entry.mediaType === "video" ? (
                <video
                  src={entry.entryUrl}
                  controls
                  className="max-h-[55vh] w-full object-contain"
                />
              ) : (
                <div className="relative min-h-56 w-full flex-1">
                  <Image
                    src={entry.entryUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )
            ) : (
              <NoMedia large />
            )}
          </div>

          {/* Side panel */}
          <div className="flex w-full flex-col justify-between border-t border-border bg-card md:w-64 md:border-l md:border-t-0">
            {/* Details */}
            <div className="space-y-4 overflow-y-auto p-4">
              <InfoSection title="User">
                <InfoRow label="Short ID" value={`User ${shortId(entry.userId)}`} />
                <InfoRow label="Full ID"  value={entry.userId} mono />
              </InfoSection>

              <hr className="border-border" />

              <InfoSection title="Submission">
                <InfoRow label="Date"      value={fmtDate(entry.createdAt)} />
                <InfoRow label="Media"     value={entry.mediaType}          />
              </InfoSection>

              {entry.caption && (
                <>
                  <hr className="border-border" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Caption
                    </p>
                    <p className="rounded-lg bg-muted/50 p-2.5 text-xs leading-relaxed text-foreground">
                      {entry.caption}
                    </p>
                  </div>
                </>
              )}

              {entry.entryUrl && (
                <a
                  href={entry.entryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  Open original file
                </a>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex flex-col gap-2 border-t border-border p-4">
              {/* Approve / Undo approve */}
              {entry.status === "active" && (
                <ModalActionBtn
                  disabled={busy}
                  onClick={() => onSetStatus(entry.id, "approved")}
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <CheckIcon className="h-4 w-4" />
                  Approve
                </ModalActionBtn>
              )}
              {(entry.status === "approved" || entry.status === "rejected") && (
                <ModalActionBtn
                  disabled={busy}
                  onClick={() => onSetStatus(entry.id, "active")}
                  className="border border-border text-muted-foreground hover:bg-muted"
                >
                  <UndoIcon className="h-4 w-4" />
                  Reset to Pending
                </ModalActionBtn>
              )}

              {/* Mark winner / Unmark */}
              {entry.status === "approved" && (
                <ModalActionBtn
                  disabled={busy}
                  onClick={() => onSetStatus(entry.id, "winner")}
                  className="bg-violet-500 text-white hover:bg-violet-600"
                >
                  <CrownIcon className="h-4 w-4" />
                  Mark as Winner
                </ModalActionBtn>
              )}
              {entry.status === "winner" && (
                <ModalActionBtn
                  disabled={busy}
                  onClick={() => onSetStatus(entry.id, "approved")}
                  className="border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                >
                  <UndoIcon className="h-4 w-4" />
                  Remove Winner
                </ModalActionBtn>
              )}

              {/* Reject / Undo reject */}
              {entry.status !== "rejected" && entry.status !== "winner" && (
                <ModalActionBtn
                  disabled={busy}
                  onClick={() => onSetStatus(entry.id, "rejected")}
                  className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <XIcon className="h-4 w-4" />
                  Reject
                </ModalActionBtn>
              )}
              {entry.status === "rejected" && (
                <ModalActionBtn
                  disabled={busy}
                  onClick={() => onSetStatus(entry.id, "active")}
                  className="border border-border text-muted-foreground hover:bg-muted"
                >
                  <UndoIcon className="h-4 w-4" />
                  Restore Entry
                </ModalActionBtn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Btn({
  children, onClick, disabled, variant,
}: {
  children: React.ReactNode
  onClick:  () => void
  disabled: boolean
  variant:  "approve" | "reject" | "winner" | "undo"
}) {
  const cls = {
    approve: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    reject:  "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    winner:  "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
    undo:    "border-border bg-background text-muted-foreground hover:bg-muted",
  }[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors disabled:opacity-40",
        cls,
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function ModalActionBtn({
  children, onClick, disabled, className,
}: {
  children:  React.ReactNode
  onClick:   () => void
  disabled:  boolean
  className: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
        className,
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
      <span className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm">
        <PlayIcon className="h-5 w-5 text-white" />
      </span>
    </div>
  )
}

function NoMedia({ large }: { large?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
      <ImageOffIcon className={large ? "h-12 w-12" : "h-8 w-8"} />
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className={["text-right text-[11px] font-medium text-foreground break-all", mono ? "font-mono text-[10px]" : ""].join(" ")}>
        {value}
      </span>
    </div>
  )
}

// ─── Skeleton / Error / Empty ─────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <GridSkeleton />
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="flex gap-1">
              <div className="h-6 flex-1 animate-pulse rounded-lg bg-muted" />
              <div className="h-6 flex-1 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">Failed to load entries</p>
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

function EmptyState({ tab }: { tab: FilterTab }) {
  const msg: Record<FilterTab, string> = {
    all:      "No entries submitted yet.",
    active:   "No entries pending review.",
    approved: "No approved entries yet.",
    rejected: "No rejected entries.",
    winner:   "No winners selected yet.",
  }
  return (
    <div className="rounded-xl border border-border bg-card py-16 text-center">
      <ImageOffIcon className="mx-auto mb-3 h-9 w-9 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{msg[tab]}</p>
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

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
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
