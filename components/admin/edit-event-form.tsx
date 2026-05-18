"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// ----- Types ----- //

/** Event data for editing (VotingEvent + optional description from API). */
export interface EditEventFormEvent {
  id: string
  name: string
  status: "draft" | "open" | "closed"
  startsAt: string
  endsAt: string
  resultsPublic: boolean
  description?: string | null
}

export interface EditEventFormValues {
  name: string
  description: string
  startsAt: string
  endsAt: string
  resultsPublic: boolean
}

export interface EditEventFormErrors {
  name?: string
  startsAt?: string
  endsAt?: string
  form?: string
}

// ----- Helpers ----- //

/** Format ISO date for datetime-local input (YYYY-MM-DDTHH:mm). */
function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function validate(values: EditEventFormValues): EditEventFormErrors {
  const errors: EditEventFormErrors = {}
  if (!values.name.trim()) errors.name = "Event title is required."
  if (!values.startsAt) errors.startsAt = "Start date & time is required."
  if (!values.endsAt) errors.endsAt = "End date & time is required."
  if (values.startsAt && values.endsAt) {
    const start = new Date(values.startsAt).getTime()
    const end = new Date(values.endsAt).getTime()
    if (start >= end) errors.endsAt = "End date & time must be after start date & time."
  }
  return errors
}

function statusLabel(status: EditEventFormEvent["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusBadgeClass(status: EditEventFormEvent["status"]): string {
  switch (status) {
    case "draft":
      return "border-muted-foreground/30 bg-muted text-muted-foreground"
    case "open":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "closed":
      return "border-red-200 bg-red-50 text-red-700"
  }
}

// ----- Icons ----- //

function CalendarClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

// ----- Component ----- //

/** API response shape for GET voting event (ISO date strings). */
interface FetchedEvent {
  id: string
  name: string
  status: string
  startsAt: string
  endsAt: string
  resultsPublic: boolean
  description?: string | null
}

export interface EditEventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Event ID to fetch and edit; form fetches when open and this is set. */
  eventId: string | null
  /** Called with form values on save. No API call inside form. */
  onSubmit?: (values: EditEventFormValues) => void | Promise<void>
}

export function EditEventForm({ open, onOpenChange, eventId, onSubmit }: EditEventFormProps) {
  const [event, setEvent] = useState<EditEventFormEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [values, setValues] = useState<EditEventFormValues>({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    resultsPublic: false,
  })
  const [errors, setErrors] = useState<EditEventFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  const handlePreview = useCallback(async () => {
    if (!event?.id || event.status !== "draft") return
    setPreviewLoading(true)
    setErrors((prev) => ({ ...prev, form: undefined }))
    try {
      const res = await fetch(`/api/admin/voting-events/${event.id}/preview-token`, {
        method: "POST",
      })
      const data = (await res.json().catch(() => ({}))) as {
        token?: string
        message?: string | string[]
      }
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
        throw new Error(msg || "Could not create preview link.")
      }
      if (!data.token) throw new Error("Invalid preview response.")
      const url = `/vote?preview=1&event=${encodeURIComponent(event.id)}&token=${encodeURIComponent(data.token)}`
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        form: e instanceof Error ? e.message : "Could not open preview.",
      }))
    } finally {
      setPreviewLoading(false)
    }
  }, [event])

  useEffect(() => {
    if (!open || !eventId) {
      setEvent(null)
      setFetchError(null)
      return
    }
    setFetchError(null)
    setLoading(true)
    fetch(`/api/admin/voting-events/${eventId}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(typeof d.message === "string" ? d.message : "Failed to load event") })
        return res.json() as Promise<FetchedEvent>
      })
      .then((data) => {
        const status = (data.status === "open" || data.status === "closed" ? data.status : "draft") as EditEventFormEvent["status"]
        setEvent({
          id: data.id,
          name: data.name,
          status,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          resultsPublic: data.resultsPublic,
          description: data.description ?? null,
        })
        setValues({
          name: data.name,
          description: data.description ?? "",
          startsAt: toDateTimeLocal(data.startsAt),
          endsAt: toDateTimeLocal(data.endsAt),
          resultsPublic: data.resultsPublic,
        })
        setErrors({})
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : "Failed to load event")
        setEvent(null)
      })
      .finally(() => setLoading(false))
  }, [open, eventId])

  const setField = useCallback(<K extends keyof EditEventFormValues>(field: K, value: EditEventFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field as keyof EditEventFormErrors]
      return next
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const nextErrors = validate(values)
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) return
      if (isSubmitting) return
      setIsSubmitting(true)
      setErrors((prev) => ({ ...prev, form: undefined }))
      try {
        await onSubmit?.(values)
        onOpenChange(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
        setErrors((prev) => ({ ...prev, form: message }))
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, onSubmit, onOpenChange, isSubmitting],
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setErrors({})
        setFetchError(null)
      }
      onOpenChange(next)
    },
    [onOpenChange],
  )

  const status = event?.status ?? "draft"
  const disableTitle = status === "open" || status === "closed"
  const disableDescription = status === "closed"
  const disableStartsAt = status === "open" || status === "closed"
  const disableEndsAt = status === "closed"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarClockIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Edit Voting Event</DialogTitle>
              <DialogDescription>
                Update event details. Status can only be changed by opening or closing the event.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
            <p className="mt-4 text-sm text-muted-foreground">Loading event…</p>
          </div>
        ) : fetchError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-6 text-center">
            <p className="text-sm text-destructive" role="alert">{fetchError}</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="mt-2">
          {errors.form && (
            <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              {errors.form}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              {/* Status badge */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-card-foreground">Status</Label>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass(status)}`}
                  >
                    {statusLabel(status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use Open / Close actions from the table to change status.
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-title" className="text-sm font-medium text-card-foreground">
                  Event Title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="edit-event-title"
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Week 6 - Save Your Islanders"
                  className="h-10"
                  disabled={disableTitle}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "edit-event-title-error" : undefined}
                />
                {errors.name && (
                  <p id="edit-event-title-error" className="text-xs text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Displayed on the public voting page.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-description" className="text-sm font-medium text-card-foreground">
                  Description
                </Label>
                <Textarea
                  id="edit-event-description"
                  value={values.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the voting event and any rules..."
                  className="min-h-[120px] resize-none"
                  disabled={disableDescription}
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Shown beneath the title on the voting page.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Start time */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-start" className="text-sm font-medium text-card-foreground">
                  Start Date & Time <span className="text-primary">*</span>
                </Label>
                <Input
                  id="edit-event-start"
                  type="datetime-local"
                  value={values.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                  className="h-10"
                  disabled={disableStartsAt}
                  aria-invalid={!!errors.startsAt}
                  aria-describedby={errors.startsAt ? "edit-event-start-error" : undefined}
                />
                {errors.startsAt && (
                  <p id="edit-event-start-error" className="text-xs text-destructive" role="alert">
                    {errors.startsAt}
                  </p>
                )}
              </div>

              {/* End time */}
              <div className="space-y-2">
                <Label htmlFor="edit-event-end" className="text-sm font-medium text-card-foreground">
                  End Date & Time <span className="text-primary">*</span>
                </Label>
                <Input
                  id="edit-event-end"
                  type="datetime-local"
                  value={values.endsAt}
                  onChange={(e) => setField("endsAt", e.target.value)}
                  className="h-10"
                  disabled={disableEndsAt}
                  aria-invalid={!!errors.endsAt}
                  aria-describedby={errors.endsAt ? "edit-event-end-error" : undefined}
                />
                {errors.endsAt && (
                  <p id="edit-event-end-error" className="text-xs text-destructive" role="alert">
                    {errors.endsAt}
                  </p>
                )}
              </div>

              {/* Results Public toggle */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card">
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="edit-results-public" className="text-sm font-medium text-card-foreground">
                        Results Public
                      </Label>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        When enabled, vote tallies are visible to the public after voting closes.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="edit-results-public"
                    checked={values.resultsPublic}
                    onCheckedChange={(checked) => setField("resultsPublic", !!checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            {status === "draft" && event && (
              <Button
                type="button"
                variant="outline"
                className="sm:mr-auto"
                onClick={handlePreview}
                disabled={previewLoading || isSubmitting || loading}
              >
                {previewLoading ? "Opening…" : "Preview"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
