"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ----- Types ----- //

export type CompetitionStatus = "draft" | "active" | "upcoming" | "completed"
export type CompetitionType = "quiz" | "poll" | "prediction" | "upload"

export interface CompetitionQuestion {
  id?: string
  question: string
  options: string[]
  correctAnswer: string
}

export interface Competition {
  id: string
  title: string
  slug: string
  type: CompetitionType
  description: string | null
  bannerUrl: string | null
  sponsorName: string | null
  sponsorLogo: string | null
  rewardConfig: string | null
  startAt: string | null
  endAt: string | null
  status: CompetitionStatus
  participantCount: number
  questions: CompetitionQuestion[]
}

// ----- Helpers ----- //

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  })
}

const TYPE_LABELS: Record<CompetitionType, string> = {
  quiz: "Quiz",
  poll: "Poll",
  prediction: "Prediction",
  upload: "Upload",
}

const TYPE_BADGE: Record<CompetitionType, string> = {
  quiz: "border-amber-200 bg-amber-50 text-amber-700",
  poll: "border-sky-200 bg-sky-50 text-sky-700",
  prediction: "border-purple-200 bg-purple-50 text-purple-700",
  upload: "border-rose-200 bg-rose-50 text-rose-700",
}

const STATUS_LABEL: Record<CompetitionStatus, string> = {
  draft: "Draft",
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
}

const STATUS_TEXT: Record<CompetitionStatus, string> = {
  draft: "text-muted-foreground",
  active: "text-emerald-600",
  upcoming: "text-sky-600",
  completed: "text-purple-600",
}

// ----- Icons ----- //

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

// ----- Stats ----- //

function CompetitionStats({
  total, active, upcoming, completed,
}: {
  total: number; active: number; upcoming: number; completed: number
}) {
  const cards = [
    { label: "Total Competitions", value: total, accent: "bg-foreground/5 text-foreground" },
    { label: "Active", value: active, accent: "bg-emerald-50 text-emerald-700" },
    { label: "Upcoming", value: upcoming, accent: "bg-sky-50 text-sky-700" },
    { label: "Completed", value: completed, accent: "bg-purple-50 text-purple-700" },
  ]
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-card-foreground">{card.value}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${card.accent}`}>
              {card.label.split(" ")[0].toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ----- Field Error ----- //

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p role="alert" className="mt-1 text-xs font-medium text-destructive">{message}</p>
}

// ----- Question Builder (quiz type only) ----- //

interface QuestionDraft {
  question: string
  options: string[]
  correctAnswer: string
}

function QuestionBuilder({
  questions, onChange, disabled,
}: {
  questions: QuestionDraft[]
  onChange: (q: QuestionDraft[]) => void
  disabled: boolean
}) {
  function addQuestion() {
    onChange([...questions, { question: "", options: ["", ""], correctAnswer: "" }])
  }
  function removeQuestion(qi: number) {
    onChange(questions.filter((_, i) => i !== qi))
  }
  function patch(qi: number, update: Partial<QuestionDraft>) {
    onChange(questions.map((q, i) => (i === qi ? { ...q, ...update } : q)))
  }
  function addOption(qi: number) {
    const q = questions[qi]
    if (q.options.length >= 6) return
    patch(qi, { options: [...q.options, ""] })
  }
  function removeOption(qi: number, oi: number) {
    const q = questions[qi]
    if (q.options.length <= 2) return
    const opts = q.options.filter((_, i) => i !== oi)
    patch(qi, {
      options: opts,
      correctAnswer: q.correctAnswer === q.options[oi] ? "" : q.correctAnswer,
    })
  }
  function updateOption(qi: number, oi: number, val: string) {
    const q = questions[qi]
    const opts = q.options.map((o, i) => (i === oi ? val : o))
    patch(qi, {
      options: opts,
      correctAnswer: q.correctAnswer === q.options[oi] ? val : q.correctAnswer,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          Questions
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            ({questions.length})
          </span>
        </Label>
        <Button
          type="button" variant="outline" size="sm"
          className="h-7 gap-1 text-xs"
          onClick={addQuestion} disabled={disabled}
        >
          <PlusIcon className="h-3 w-3" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          No questions yet — click "Add Question" to start building the quiz.
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-lg border border-border bg-background p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Question {qi + 1}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                disabled={disabled}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                aria-label={`Remove question ${qi + 1}`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Question Text</Label>
              <Input
                value={q.question}
                placeholder="e.g. Who was the first to enter the villa?"
                onChange={(e) => patch(qi, { question: e.target.value })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Options</Label>
                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(qi)}
                    disabled={disabled}
                    className="text-xs text-primary hover:underline disabled:opacity-40"
                  >
                    + Add option
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-[11px] font-bold text-muted-foreground">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <Input
                      value={opt}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      disabled={disabled}
                      className="h-8 text-sm"
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qi, oi)}
                        disabled={disabled}
                        className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                        aria-label="Remove option"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Correct Answer</Label>
              <select
                value={q.correctAnswer}
                onChange={(e) => patch(qi, { correctAnswer: e.target.value })}
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="" disabled>Select correct answer…</option>
                {q.options.map((opt, oi) =>
                  opt.trim() ? (
                    <option key={oi} value={opt}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </option>
                  ) : null
                )}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ----- Form types ----- //

interface CompetitionFields {
  title: string
  slug: string
  type: CompetitionType | ""
  description: string
  startAt: string
  endAt: string
  sponsorName: string
  rewardConfig: string
}

type FormErrors = Partial<Record<keyof CompetitionFields | "questions", string>>

const EMPTY_FIELDS: CompetitionFields = {
  title: "", slug: "", type: "", description: "",
  startAt: "", endAt: "", sponsorName: "", rewardConfig: "",
}

function validateFields(
  fields: CompetitionFields,
  questions: QuestionDraft[],
): FormErrors {
  const e: FormErrors = {}
  if (!fields.title.trim()) e.title = "Title is required."
  if (!fields.slug.trim()) e.slug = "Slug is required."
  if (!fields.type) e.type = "Please select a competition type."

  const hasQuestions = fields.type === "quiz" || fields.type === "poll" || fields.type === "prediction"
  if (hasQuestions) {
    if (fields.type === "quiz" && questions.length === 0) {
      e.questions = "Add at least one question for a quiz competition."
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        e.questions = `Question ${i + 1} is missing its question text.`
        break
      }
      const filledOpts = q.options.filter((o) => o.trim())
      if (filledOpts.length < 2) {
        e.questions = `Question ${i + 1} needs at least 2 non-empty options.`
        break
      }
      // correctAnswer is required for quiz/prediction but optional for polls
      if (fields.type !== "poll" && !q.correctAnswer.trim()) {
        e.questions = `Question ${i + 1} has no correct answer selected.`
        break
      }
    }
  }
  return e
}

// ----- Competition Form Dialog ----- //

function CompetitionFormDialog({
  open, onOpenChange, competition, onCreated, onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  competition: Competition | null
  onCreated?: (c: Competition) => void
  onUpdated?: (c: Competition) => void
}) {
  const router = useRouter()
  const isEdit = !!competition

  const [fields, setFields] = useState<CompetitionFields>(EMPTY_FIELDS)
  const [slugTouched, setSlugTouched] = useState(false)
  const [questions, setQuestions] = useState<QuestionDraft[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Sponsor logo upload state
  const [sponsorLogo, setSponsorLogo] = useState<{ url: string; name: string } | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [logoDragOver, setLogoDragOver] = useState(false)

  useEffect(() => {
    if (!open) return
    if (competition) {
      setFields({
        title: competition.title,
        slug: competition.slug,
        type: competition.type,
        description: competition.description ?? "",
        startAt: competition.startAt ? competition.startAt.slice(0, 16) : "",
        endAt: competition.endAt ? competition.endAt.slice(0, 16) : "",
        sponsorName: competition.sponsorName ?? "",
        rewardConfig: competition.rewardConfig ?? "",
      })
      setSponsorLogo(competition.sponsorLogo ? { url: competition.sponsorLogo, name: "logo" } : null)
      setSlugTouched(true)
      // Populate existing questions so the editor shows them when editing
      setQuestions(
        (competition.questions ?? []).map((q) => ({
          question: q.question,
          options: Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : ["", ""],
          correctAnswer: q.correctAnswer ?? "",
        })),
      )
    } else {
      setFields(EMPTY_FIELDS)
      setSponsorLogo(null)
      setSlugTouched(false)
      setQuestions([])
    }
    setErrors({})
    setSubmitError(null)
    setUploadError(null)
  }, [open, competition])

  const handleClose = useCallback(
    (val: boolean) => {
      if (!val && submitting) return
      onOpenChange(val)
    },
    [submitting, onOpenChange],
  )

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setFields((prev) => {
      const next = { ...prev, [name]: value }
      if (name === "title" && !slugTouched) {
        next.slug = slugify(value)
      }
      return next
    })
    if (name === "slug") setSlugTouched(true)
    if (errors[name as keyof CompetitionFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleLogoSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const file = Array.from(fileList).find((f) => f.type.startsWith("image/"))
    if (!file) return

    setUploadingLogo(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("images", file)

    try {
      const res = await fetch("/api/admin/products/images", {
        method: "POST",
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError((data as { message?: string }).message || "Upload failed. Please try again.")
        return
      }
      const urls = (data as { urls?: string[] }).urls ?? []
      if (urls[0]) {
        setSponsorLogo({ url: urls[0], name: file.name })
      }
    } catch {
      setUploadError("Network error during upload. Please try again.")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)

      const fieldErrors = validateFields(fields, questions)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        return
      }

      setSubmitting(true)
      try {
        const body: Record<string, unknown> = {
          title: fields.title.trim(),
          slug: fields.slug.trim(),
          type: fields.type,
          description: fields.description.trim() || null,
          startAt: fields.startAt || null,
          endAt: fields.endAt || null,
          sponsorName: fields.sponsorName.trim() || null,
          sponsorLogo: sponsorLogo?.url ?? null,
          rewardConfig: fields.rewardConfig.trim() || null,
        }

        const supportsQuestions =
          fields.type === "quiz" || fields.type === "poll" || fields.type === "prediction"
        if (supportsQuestions && questions.length > 0) {
          body.questions = questions.map((q) => ({
            question: q.question.trim(),
            options: q.options.filter((o) => o.trim()),
            correctAnswer: q.correctAnswer || null,
          }))
        }

        const res = await fetch(
          isEdit ? `/api/admin/competitions/${competition!.id}` : "/api/admin/competitions",
          {
            method: isEdit ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        )

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          const msg =
            typeof (data as { message?: unknown }).message === "string"
              ? (data as { message: string }).message
              : Array.isArray((data as { message?: unknown[] }).message)
                ? (data as { message: string[] }).message.join(", ")
                : isEdit
                  ? "Failed to update competition. Please try again."
                  : "Failed to create competition. Please try again."
          setSubmitError(msg)
          return
        }

        const saved = data as Competition
        if (isEdit) {
          onUpdated?.(saved)
        } else {
          onCreated?.(saved)
        }
        handleClose(false)
        router.refresh()
      } catch {
        setSubmitError("Network error. Please check your connection and try again.")
      } finally {
        setSubmitting(false)
      }
    },
    [isEdit, competition, fields, questions, sponsorLogo, onCreated, onUpdated, handleClose, router],
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Competition" : "Create Competition"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update details for "${competition.title}".`
              : "Set up a new competition for Love Island Nigeria."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-h-[70vh] space-y-5 overflow-y-auto pr-1"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="comp-title">
              Title <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="comp-title"
              name="title"
              placeholder="e.g. Week 3 Trivia Challenge"
              value={fields.title}
              onChange={handleFieldChange}
              aria-invalid={!!errors.title}
              disabled={submitting}
            />
            <FieldError message={errors.title} />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="comp-slug">Slug</Label>
            <Input
              id="comp-slug"
              name="slug"
              placeholder="week-3-trivia-challenge"
              value={fields.slug}
              onChange={handleFieldChange}
              disabled={submitting}
              className="font-mono text-sm"
            />
            <FieldError message={errors.slug} />
          </div>

          {/* Type & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comp-type">
                Type <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <select
                id="comp-type"
                name="type"
                value={fields.type}
                onChange={handleFieldChange}
                disabled={submitting}
                aria-invalid={!!errors.type}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="" disabled>Select type</option>
                <option value="quiz">Quiz</option>
                <option value="poll">Poll</option>
                <option value="prediction">Prediction</option>
                <option value="upload">Upload</option>
              </select>
              <FieldError message={errors.type} />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="comp-start">Start Date</Label>
              <Input
                id="comp-start"
                name="startAt"
                type="datetime-local"
                value={fields.startAt}
                onChange={handleFieldChange}
                disabled={submitting}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="comp-end">End Date</Label>
            <Input
              id="comp-end"
              name="endAt"
              type="datetime-local"
              value={fields.endAt}
              onChange={handleFieldChange}
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="comp-desc">Description</Label>
            <Textarea
              id="comp-desc"
              name="description"
              placeholder="Brief description shown to participants…"
              className="min-h-[80px] resize-none"
              value={fields.description}
              onChange={handleFieldChange}
              disabled={submitting}
            />
          </div>

          <Separator />

          {/* Sponsor */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-card-foreground">Sponsor</p>

            <div className="space-y-2">
              <Label htmlFor="comp-sponsor-name">Sponsor Name</Label>
              <Input
                id="comp-sponsor-name"
                name="sponsorName"
                placeholder="e.g. Pepsi Nigeria"
                value={fields.sponsorName}
                onChange={handleFieldChange}
                disabled={submitting}
              />
            </div>

            {/* Sponsor Logo Upload */}
            <div className="space-y-2">
              <Label>Sponsor Logo</Label>
              {uploadError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {uploadError}
                </p>
              )}
              {sponsorLogo ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                  <img
                    src={sponsorLogo.url}
                    alt="Sponsor logo"
                    className="h-12 w-12 rounded-md border border-border object-contain bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-card-foreground">{sponsorLogo.name}</p>
                    <p className="text-xs text-muted-foreground">Sponsor logo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSponsorLogo(null)}
                    disabled={submitting}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
                    aria-label="Remove logo"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true) }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setLogoDragOver(false); handleLogoSelect(e.dataTransfer.files) }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 transition-colors ${
                    uploadingLogo
                      ? "cursor-not-allowed border-primary/40 bg-primary/5"
                      : logoDragOver
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/40 hover:border-primary/40 hover:bg-muted/60"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    {uploadingLogo
                      ? <SpinnerIcon className="h-4 w-4 animate-spin text-primary" />
                      : <UploadIcon className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {uploadingLogo ? "Uploading…" : "Upload logo"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={submitting || uploadingLogo}
                    onChange={(e) => handleLogoSelect(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          <Separator />

          {/* Reward Config */}
          <div className="space-y-2">
            <Label htmlFor="comp-reward">Reward Config</Label>
            <Textarea
              id="comp-reward"
              name="rewardConfig"
              placeholder={`{"type": "voucher", "value": "5000", "currency": "NGN"}`}
              className="min-h-[60px] resize-none font-mono text-xs"
              value={fields.rewardConfig}
              onChange={handleFieldChange}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">Optional JSON config describing the reward.</p>
          </div>

          {/* Questions — quiz, poll, and prediction types all support questions */}
          {(fields.type === "quiz" || fields.type === "poll" || fields.type === "prediction") && (
            <>
              <Separator />
              <QuestionBuilder
                questions={questions}
                onChange={setQuestions}
                disabled={submitting}
              />
              <FieldError message={errors.questions} />
            </>
          )}

          <Separator />

          {/* Submit error */}
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent"
              disabled={submitting}
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5" disabled={submitting || uploadingLogo}>
              {submitting ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : isEdit ? (
                <>
                  <PencilIcon className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Create Competition
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ----- Delete Confirm Dialog ----- //

function DeleteConfirmDialog({
  competition, onClose, onDeleted,
}: {
  competition: Competition | null
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!competition) { setError(null); setDeleting(false) }
  }, [competition])

  const handleDelete = useCallback(async () => {
    if (!competition || deleting) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/competitions/${competition.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { message?: string }).message || "Failed to delete competition. Please try again.")
        return
      }
      onDeleted(competition.id)
      router.refresh()
      onClose()
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setDeleting(false)
    }
  }, [competition, deleting, onDeleted, onClose, router])

  return (
    <Dialog open={!!competition} onOpenChange={(val) => { if (!val && !deleting) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Competition</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-card-foreground">{competition?.title}</span>?{" "}
            All questions and submissions will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- Main Component ----- //

export function CompetitionsTable({ initialCompetitions }: { initialCompetitions: Competition[] }) {
  // Radix UI uses useId internally. When Next.js SSR renders this component the
  // IDs it generates differ from the ones the client produces (different tree
  // depth / hook call count), causing a hydration mismatch. Since this is an
  // admin-only page with no SEO requirements we simply skip SSR entirely and
  // render a lightweight skeleton until the component mounts on the client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [competitions, setCompetitions] = useState(initialCompetitions)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editComp, setEditComp] = useState<Competition | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<Competition | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const [toggleErrorIds, setToggleErrorIds] = useState<Set<string>>(new Set())
  const [tableError, setTableError] = useState<string | null>(null)

  const stats = useMemo(() => ({
    total: competitions.length,
    active: competitions.filter((c) => c.status === "active").length,
    upcoming: competitions.filter((c) => c.status === "upcoming").length,
    completed: competitions.filter((c) => c.status === "completed").length,
  }), [competitions])

  const filtered = useMemo(() => {
    let list = competitions
    if (activeTab === "active") list = list.filter((c) => c.status === "active")
    else if (activeTab === "upcoming") list = list.filter((c) => c.status === "upcoming")
    else if (activeTab === "completed") list = list.filter((c) => c.status === "completed")
    else if (activeTab === "draft") list = list.filter((c) => c.status === "draft")
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q),
      )
    }
    return list
  }, [competitions, activeTab, search])

  const toggleStatus = useCallback(async (id: string) => {
    if (togglingIds.has(id)) return

    const current = competitions.find((c) => c.id === id)
    if (!current || current.status === "completed") return

    const nextStatus: CompetitionStatus = current.status === "active" ? "draft" : "active"

    setCompetitions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)),
    )
    setTogglingIds((prev) => new Set(prev).add(id))
    setToggleErrorIds((prev) => { const s = new Set(prev); s.delete(id); return s })

    try {
      const res = await fetch(`/api/admin/competitions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        setCompetitions((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: current.status } : c)),
        )
        setToggleErrorIds((prev) => new Set(prev).add(id))
        return
      }
      const data = await res.json().catch(() => null)
      if (data) {
        setCompetitions((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...(data as Partial<Competition>) } : c)),
        )
      }
    } catch {
      setCompetitions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: current.status } : c)),
      )
      setToggleErrorIds((prev) => new Set(prev).add(id))
    } finally {
      setTogglingIds((prev) => { const s = new Set(prev); s.delete(id); return s })
    }
  }, [competitions, togglingIds])

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden="true">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card" />
          ))}
        </div>
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-9 w-64 rounded-lg bg-muted" />
          <div className="h-9 w-36 rounded-lg bg-muted" />
        </div>
        {/* Table skeleton */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-10 border-b border-border bg-muted/40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="ml-auto h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <CompetitionStats
        total={stats.total}
        active={stats.active}
        upcoming={stats.upcoming}
        completed={stats.completed}
      />

      {/* Error banner */}
      {tableError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{tableError}</span>
          <button
            type="button"
            className="ml-4 shrink-0 rounded p-0.5 hover:bg-destructive/20"
            onClick={() => setTableError(null)}
            aria-label="Dismiss error"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                {stats.total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                {stats.active}
              </span>
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search competitions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-64"
            />
          </div>

          <Button size="sm" className="h-9 gap-1.5" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create Competition</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CompetitionFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        competition={null}
        onCreated={(c) => setCompetitions((prev) => [c, ...prev])}
      />
      <CompetitionFormDialog
        open={!!editComp}
        onOpenChange={(open) => { if (!open) setEditComp(null) }}
        competition={editComp}
        onUpdated={(updated) =>
          setCompetitions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        }
      />
      <DeleteConfirmDialog
        competition={deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onDeleted={(id) => setCompetitions((prev) => prev.filter((c) => c.id !== id))}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Competition</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">Participants</TableHead>
              <TableHead className="hidden lg:table-cell">Start Date</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <TrophyIcon className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm">No competitions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((comp) => (
                <TableRow
                  key={comp.id}
                  className={comp.status === "draft" ? "opacity-60" : ""}
                >
                  {/* Title + Slug */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">{comp.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        /{comp.slug}
                      </p>
                    </div>
                  </TableCell>

                  {/* Type badge */}
                  <TableCell>
                    <Badge variant="outline" className={TYPE_BADGE[comp.type]}>
                      {TYPE_LABELS[comp.type]}
                    </Badge>
                  </TableCell>

                  {/* Status toggle */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {comp.status === "completed" ? (
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                          Completed
                        </Badge>
                      ) : togglingIds.has(comp.id) ? (
                        <SpinnerIcon className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Switch
                            checked={comp.status === "active"}
                            onCheckedChange={() => toggleStatus(comp.id)}
                            aria-label={`Toggle ${comp.title} status`}
                          />
                          {toggleErrorIds.has(comp.id) ? (
                            <span className="text-xs font-medium text-destructive" title="Failed to update status.">
                              Error
                            </span>
                          ) : (
                            <span className={`text-xs font-medium ${STATUS_TEXT[comp.status]}`}>
                              {STATUS_LABEL[comp.status]}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Participants */}
                  <TableCell className="hidden text-right font-mono text-sm text-card-foreground md:table-cell">
                    {comp.participantCount.toLocaleString("en-NG")}
                  </TableCell>

                  {/* Start Date */}
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(comp.startAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={`Edit ${comp.title}`}
                        onClick={() => setEditComp(comp)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <EllipsisIcon className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditComp(comp)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Competition
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteCandidate(comp)}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-bold text-card-foreground">{filtered.length}</span> of{" "}
          <span className="font-bold text-card-foreground">{competitions.length}</span> competitions
        </p>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Total participants:{" "}
          <span className="font-bold text-card-foreground">
            {competitions.reduce((s, c) => s + c.participantCount, 0).toLocaleString("en-NG")}
          </span>
        </p>
      </div>
    </div>
  )
}
