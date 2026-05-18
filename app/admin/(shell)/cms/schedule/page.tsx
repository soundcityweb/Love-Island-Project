"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ── Types ──────────────────────────────────────────────────────────────────

type ScheduleContentType = "episode" | "first_look" | "recap" | "podcast" | "highlight"
type SchedulePlatform = "ontv" | "soundcity" | "spice" | "digital"
type ScheduleStatus = "live" | "upcoming" | "completed"

interface ScheduleRow {
  id: string
  title: string
  episodeNumber: number | null
  contentType: ScheduleContentType
  platform: SchedulePlatform
  date: string
  startTime: string
  endTime: string | null
  description: string | null
  isPublished: boolean
  createdAt: string
  status: ScheduleStatus
  isNowPlaying: boolean
}

const CONTENT_TYPES: { value: ScheduleContentType; label: string }[] = [
  { value: "episode", label: "Episode" },
  { value: "first_look", label: "First look" },
  { value: "recap", label: "Recap" },
  { value: "podcast", label: "Podcast" },
  { value: "highlight", label: "Highlight" },
]

const PLATFORMS: { value: SchedulePlatform; label: string }[] = [
  { value: "ontv", label: "On TV" },
  { value: "soundcity", label: "Soundcity" },
  { value: "spice", label: "Spice" },
  { value: "digital", label: "Digital" },
]

const scheduleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  platform: z.enum(["ontv", "soundcity", "spice", "digital"], {
    required_error: "Platform is required",
    invalid_type_error: "Platform is required",
  }),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  contentType: z.enum(["episode", "first_look", "recap", "podcast", "highlight"]),
  episodeNumber: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  isPublished: z.boolean(),
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

const EMPTY_FORM_VALUES: ScheduleFormValues = {
  title: "",
  platform: "ontv",
  date: "",
  startTime: "",
  contentType: "episode",
  episodeNumber: "",
  endTime: "",
  description: "",
  isPublished: true,
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = typeof v === "number" ? v : parseInt(String(v), 10)
  return Number.isNaN(n) ? null : n
}

function normalizeSchedule(raw: Record<string, unknown>): ScheduleRow {
  const pub = raw.isPublished ?? raw.is_published
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    episodeNumber: numOrNull(raw.episodeNumber ?? raw.episode_number),
    contentType: (raw.contentType ?? raw.content_type) as ScheduleContentType,
    platform: (raw.platform ?? "ontv") as SchedulePlatform,
    date: String(raw.date ?? ""),
    startTime: String(raw.startTime ?? raw.start_time ?? ""),
    endTime: ((raw.endTime ?? raw.end_time) as string | null) ?? null,
    description: ((raw.description as string | null) ?? null),
    isPublished: pub === undefined ? true : Boolean(pub),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    status: (raw.status ?? "upcoming") as ScheduleStatus,
    isNowPlaying: Boolean(raw.isNowPlaying ?? raw.is_now_playing),
  }
}

function toTimeInputValue(hms: string | null | undefined): string {
  if (!hms) return ""
  const parts = hms.split(":")
  if (parts.length < 2) return ""
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
}

function formatTimeRange(start: string, end: string | null): string {
  const s = toTimeInputValue(start) || start.slice(0, 5)
  if (!end) return s
  const e = toTimeInputValue(end) || end.slice(0, 5)
  return `${s} – ${e}`
}

function labelForContentType(v: ScheduleContentType): string {
  return CONTENT_TYPES.find((c) => c.value === v)?.label ?? v
}

function labelForPlatform(v: SchedulePlatform): string {
  return PLATFORMS.find((p) => p.value === v)?.label ?? v
}

function toApiTime(v: string): string {
  const t = (v ?? "").trim()
  if (!t) return ""
  return t.length === 5 ? `${t}:00` : t
}

function valuesToPayload(values: ScheduleFormValues): Record<string, unknown> {
  const episodeNum = (values.episodeNumber ?? "").trim()
  const body: Record<string, unknown> = {
    title: values.title,
    contentType: values.contentType,
    platform: values.platform,
    date: values.date,
    startTime: toApiTime(values.startTime),
    description: (values.description ?? "").trim() || undefined,
    isPublished: values.isPublished,
  }
  if (episodeNum !== "" && !Number.isNaN(parseInt(episodeNum, 10))) {
    body.episodeNumber = parseInt(episodeNum, 10)
  }
  const endT = toApiTime(values.endTime ?? "")
  if (endT) body.endTime = endT
  return body
}

function rowToFormValues(row: ScheduleRow): ScheduleFormValues {
  return {
    title: row.title,
    platform: row.platform,
    date: row.date,
    startTime: toTimeInputValue(row.startTime),
    contentType: row.contentType,
    episodeNumber: row.episodeNumber != null ? String(row.episodeNumber) : "",
    endTime: toTimeInputValue(row.endTime ?? ""),
    description: row.description ?? "",
    isPublished: row.isPublished,
  }
}

// ── Form dialog (React Hook Form + Zod; matches article modal layout) ───────

function ScheduleFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: ScheduleRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: EMPTY_FORM_VALUES,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    if (!open) return
    setSubmitError(null)
    if (editing) {
      reset(rowToFormValues(editing))
    } else {
      reset(EMPTY_FORM_VALUES)
    }
  }, [open, editing, reset])

  if (!open) return null

  const onValidSubmit = async (values: ScheduleFormValues) => {
    setSubmitError(null)
    const body = valuesToPayload(values)
    try {
      const url = editing ? `/api/schedule/${editing.id}` : "/api/schedule"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { message?: string }).message ?? "Save failed.")
      onSaved()
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
      <div className="my-auto flex w-full max-w-xl max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {editing ? "Edit Schedule" : "New Schedule"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form
          onSubmit={handleSubmit(onValidSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            {submitError && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{submitError}</p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                maxLength={10000}
                aria-invalid={errors.title ? true : undefined}
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Episode number</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Optional"
                  {...register("episodeNumber")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Content type</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  {...register("contentType")}
                >
                  {CONTENT_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Platform *</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                aria-invalid={errors.platform ? true : undefined}
                {...register("platform")}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {errors.platform && (
                <p className="mt-1 text-xs text-destructive">{errors.platform.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Date *</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  aria-invalid={errors.date ? true : undefined}
                  {...register("date")}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Start time *</label>
                <input
                  type="time"
                  step={60}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  aria-invalid={errors.startTime ? true : undefined}
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="mt-1 text-xs text-destructive">{errors.startTime.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">End time</label>
                <input
                  type="time"
                  step={60}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  {...register("endTime")}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                rows={4}
                maxLength={50000}
                {...register("description")}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" {...register("isPublished")} />
              <span className="text-foreground">Published</span>
            </label>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-card px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function statusBadgeClass(status: ScheduleStatus): string {
  if (status === "live") return "bg-rose-500/10 text-rose-700"
  if (status === "upcoming") return "bg-sky-500/10 text-sky-700"
  return "bg-muted text-muted-foreground"
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminSchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<ScheduleRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduleRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduleRow | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/schedules?limit=200", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data.data) ? data.data : []
        setRows(list.map((row: Record<string, unknown>) => normalizeSchedule(row)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null)
      setDialogOpen(true)
      router.replace("/admin/cms/schedule")
    }
  }, [searchParams, router])

  async function handleTogglePublished(row: ScheduleRow) {
    await fetch(`/api/admin/schedules/${row.id}/toggle-published`, { method: "PATCH" })
    load()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      const res = await fetch(`/api/schedule/${deleteTarget.id}`, { method: "DELETE" })
      if (res.ok) await load()
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }

  return (
    <AdminPageWrapper
      title="TV Schedule"
      description={`${rows.length} entr${rows.length !== 1 ? "ies" : "y"} total`}
      breadcrumb={[
        { label: "Admin", href: "/admin"               },
        { label: "CMS",   href: "/admin/cms/schedule"  },
        { label: "TV Schedule"                         },
      ]}
      actions={
        <button
          onClick={() => { setEditing(null); setDialogOpen(true) }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Schedule
        </button>
      }
      noPadding
    >

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">No schedule entries yet</p>
            <button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create your first entry
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Episode</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Platform</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground" title={row.title}>
                        {row.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.episodeNumber != null ? row.episodeNumber : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{labelForPlatform(row.platform)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{labelForContentType(row.contentType)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatTimeRange(row.startTime, row.endTime)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                          >
                            {row.status === "live" ? "Live" : row.status === "upcoming" ? "Upcoming" : "Completed"}
                          </span>
                          {row.isNowPlaying && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                              Now
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublished(row)}
                            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                          >
                            {row.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(row)
                              setDialogOpen(true)
                            }}
                            className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            disabled={deletingId === row.id}
                            className="rounded-md px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      <ScheduleFormDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          void load()
        }}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete schedule entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove “${deleteTarget.title}”. This cannot be undone.`
                : "This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageWrapper>
  )
}
