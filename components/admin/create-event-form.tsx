"use client"

import { useState, useCallback } from "react"
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

/** Form values for creating a voting event (aligns with backend CreateVotingEventDto + optional fields). */
export interface CreateEventFormValues {
  name: string
  code: string
  description: string
  startsAt: string
  endsAt: string
  resultsPublic: boolean
}

const defaultFormValues: CreateEventFormValues = {
  name: "",
  code: "",
  description: "",
  startsAt: "",
  endsAt: "",
  resultsPublic: false,
}

/** Validation errors keyed by field. */
export interface CreateEventFormErrors {
  name?: string
  code?: string
  startsAt?: string
  endsAt?: string
  form?: string
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )
}

// ----- Validation ----- //

function validate(values: CreateEventFormValues): CreateEventFormErrors {
  const errors: CreateEventFormErrors = {}
  if (!values.name.trim()) {
    errors.name = "Event title is required."
  }
  if (!values.code.trim()) {
    errors.code = "Code is required."
  }
  if (!values.startsAt) {
    errors.startsAt = "Start date & time is required."
  }
  if (!values.endsAt) {
    errors.endsAt = "End date & time is required."
  }
  if (values.startsAt && values.endsAt) {
    const start = new Date(values.startsAt).getTime()
    const end = new Date(values.endsAt).getTime()
    if (start >= end) {
      errors.endsAt = "End date & time must be after start date & time."
    }
  }
  return errors
}

// ----- Component ----- //

export interface CreateEventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with form values on submit. May be async; form disables submit until it resolves. */
  onSubmit?: (values: CreateEventFormValues) => void | Promise<void>
}

export function CreateEventForm({ open, onOpenChange, onSubmit }: CreateEventFormProps) {
  const [values, setValues] = useState<CreateEventFormValues>(defaultFormValues)
  const [errors, setErrors] = useState<CreateEventFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = useCallback(<K extends keyof CreateEventFormValues>(field: K, value: CreateEventFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field as keyof CreateEventFormErrors]
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
        setValues(defaultFormValues)
        setErrors({})
        onOpenChange(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
        setErrors((prev) => ({ ...prev, form: message }))
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, onSubmit, onOpenChange, isSubmitting]
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setValues(defaultFormValues)
        setErrors({})
      }
      onOpenChange(next)
    },
    [onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarClockIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Voting Event</DialogTitle>
              <DialogDescription>
                Fill in the details below. The event will be saved as a Draft.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2">
          {errors.form && (
            <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              {errors.form}
            </p>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="event-code" className="text-sm font-medium text-card-foreground">
                  Code <span className="text-primary">*</span>
                </Label>
                <Input
                  id="event-code"
                  value={values.code}
                  onChange={(e) => setField("code", e.target.value)}
                  placeholder="e.g. week-6-save"
                  className="h-10"
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? "event-code-error" : undefined}
                />
                {errors.code && (
                  <p id="event-code-error" className="text-xs text-destructive" role="alert">
                    {errors.code}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Unique short code used in APIs and URLs.
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-sm font-medium text-card-foreground">
                  Event Title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="event-title"
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Week 6 - Save Your Islanders"
                  className="h-10"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "event-title-error" : undefined}
                />
                {errors.name && (
                  <p id="event-title-error" className="text-xs text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be displayed publicly on the voting page.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="event-description" className="text-sm font-medium text-card-foreground">
                  Description
                </Label>
                <Textarea
                  id="event-description"
                  value={values.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the voting event and any rules viewers should know..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Shown beneath the title on the public voting page.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Start time */}
              <div className="space-y-2">
                <Label htmlFor="event-start" className="text-sm font-medium text-card-foreground">
                  Start Date & Time <span className="text-primary">*</span>
                </Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={values.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                  className="h-10"
                  aria-invalid={!!errors.startsAt}
                  aria-describedby={errors.startsAt ? "event-start-error" : undefined}
                />
                {errors.startsAt && (
                  <p id="event-start-error" className="text-xs text-destructive" role="alert">
                    {errors.startsAt}
                  </p>
                )}
              </div>

              {/* End time */}
              <div className="space-y-2">
                <Label htmlFor="event-end" className="text-sm font-medium text-card-foreground">
                  End Date & Time <span className="text-primary">*</span>
                </Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={values.endsAt}
                  onChange={(e) => setField("endsAt", e.target.value)}
                  className="h-10"
                  aria-invalid={!!errors.endsAt}
                  aria-describedby={errors.endsAt ? "event-end-error" : undefined}
                />
                {errors.endsAt && (
                  <p id="event-end-error" className="text-xs text-destructive" role="alert">
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
                      <Label htmlFor="results-public" className="text-sm font-medium text-card-foreground">
                        Results Public
                      </Label>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        When enabled, live vote tallies will be visible to the public after voting closes.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="results-public"
                    checked={values.resultsPublic}
                    onCheckedChange={(checked) => setField("resultsPublic", !!checked)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 px-4 py-3">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-primary/80">
                  The event will be created as a <strong className="font-semibold text-primary">Draft</strong>.
                  You can add contestants and open voting from the event details page.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
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
                  Creating…
                </>
              ) : (
                "Create Voting Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
