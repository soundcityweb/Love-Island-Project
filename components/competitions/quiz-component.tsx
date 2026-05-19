"use client"

import { useState, useCallback, useRef } from "react"
import type { Question, SubmitResult } from "./types"
import { getOrCreateSessionId } from "@/app/lib/session"

// ── Constants ─────────────────────────────────────────────────────────────────

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"]

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  answered,
}: {
  current: number
  total: number
  answered: number
}) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/40">
          Question {current + 1} of {total}
        </span>
        <span className="font-mono text-[11px] font-bold text-primary/70">
          {pct}% complete
        </span>
      </div>
      {/* Continuous bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF4D80] to-[#FF7A17] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Segmented dot track */}
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < current
                ? "bg-primary/60"
                : i === current
                  ? "bg-primary"
                  : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function OptionButton({
  letter,
  text,
  selected,
  disabled,
  onClick,
}: {
  letter: string
  text: string
  selected: boolean
  disabled: boolean
  onClick: () => void
}) {
  let cls =
    "group relative flex w-full cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.99]"

  if (selected) {
    cls += " border-primary/60 bg-primary/12 shadow-warm"
  } else if (disabled) {
    cls += " border-white/8 bg-white/3 opacity-60 cursor-default"
  } else {
    cls += " border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cls}
      aria-pressed={selected}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
          selected
            ? "bg-primary/30 text-primary"
            : "bg-white/8 text-white/50 group-hover:bg-white/12"
        }`}
      >
        {letter}
      </span>
      <span
        className={`flex-1 text-sm font-medium leading-snug ${
          selected ? "text-white" : "text-white/75 group-hover:text-white/90"
        }`}
      >
        {text}
      </span>
      <div
        className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
          selected
            ? "border-primary bg-primary/30"
            : "border-white/15"
        }`}
      />
    </button>
  )
}

// ── QuizComponent ─────────────────────────────────────────────────────────────

export interface QuizComponentProps {
  /** Ordered list of questions fetched from the API (no correct_answer). */
  questions: Question[]
  /** Competition slug — used to build the submit endpoint. */
  slug: string
  /** Called once the quiz is successfully submitted with the server result. */
  onComplete: (result: SubmitResult, answers: Record<number, string>) => void
}

/**
 * Self-contained quiz game component.
 * Handles option selection, question navigation, and API submission.
 * Does NOT render the score / result screen — that is handled by the parent.
 */
export function QuizComponent({ questions, slug, onComplete }: QuizComponentProps) {
  const [currentIdx, setCurrentIdx]     = useState(0)
  const [answers, setAnswers]           = useState<Record<number, string>>({})
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const questionRef                     = useRef<HTMLDivElement>(null)

  const totalQ        = questions.length
  const currentQ      = questions[currentIdx]
  const selectedAnswer = answers[currentIdx] ?? null
  const answeredCount = Object.keys(answers).length
  const allAnswered   = answeredCount === totalQ
  const isLastQ       = currentIdx === totalQ - 1

  function selectOption(opt: string) {
    setAnswers((prev) => ({ ...prev, [currentIdx]: opt }))
  }

  function navigate(delta: number) {
    const next = currentIdx + delta
    if (next < 0 || next >= totalQ) return
    setCurrentIdx(next)
    questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSubmit = useCallback(async () => {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    setSubmitError(null)

    const payload: Record<string, string> = {}
    questions.forEach((q, i) => {
      payload[q.id] = answers[i] ?? ""
    })

    try {
      const sessionId = getOrCreateSessionId()
      const res  = await fetch(`/api/competitions/${slug}/submit`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body:    JSON.stringify({ answers: payload }),
      })
      const data = await res.json().catch(() => ({})) as Record<string, unknown>

      if (!res.ok) {
        setSubmitError(
          typeof data.message === "string"
            ? data.message
            : "Submission failed. Please try again.",
        )
        return
      }

      onComplete(data as unknown as SubmitResult, answers)
    } catch {
      setSubmitError("Network error. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }, [allAnswered, submitting, questions, answers, slug, onComplete])

  if (!currentQ) return null

  return (
    <div className="relative space-y-4">
      {/* Progress tracker */}
      <ProgressBar current={currentIdx} total={totalQ} answered={answeredCount} />

      {/* Question card */}
      <div
        ref={questionRef}
        className="scroll-mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6"
      >
        <p className="mb-5 text-base font-bold leading-snug text-white sm:text-lg">
          {currentQ.question}
        </p>
        <div className="space-y-2.5">
          {currentQ.options.map((opt, oi) => (
            <OptionButton
              key={oi}
              letter={OPTION_LETTERS[oi] ?? String(oi + 1)}
              text={opt}
              selected={selectedAnswer === opt}
              disabled={submitting}
              onClick={() => selectOption(opt)}
            />
          ))}
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3" role="alert">
          <XMarkIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{submitError}</p>
        </div>
      )}

      {/* Desktop navigation */}
      <div className="hidden items-center justify-between gap-3 md:flex">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={currentIdx === 0}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>

        <span className="text-xs tabular-nums text-white/25">
          {answeredCount}/{totalQ} answered
        </span>

        {isLastQ ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="inline-flex h-10 items-center gap-2 rounded-xl btn-gradient px-6 text-sm font-bold text-white shadow-warm transition-all hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit Answers
                <CheckIcon className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(1)}
            disabled={!selectedAnswer}
            className="inline-flex h-10 items-center gap-2 rounded-xl btn-gradient px-5 text-sm font-bold text-white shadow-warm transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mobile spacer (keeps last card clear of sticky bar) */}
      <div className="h-[5.5rem] md:hidden" aria-hidden />

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-foreground/96 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={currentIdx === 0}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 disabled:opacity-30"
            aria-label="Previous question"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          {isLastQ ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl btn-gradient text-sm font-bold text-white shadow-warm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>Submit Answers</>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(1)}
              disabled={!selectedAnswer}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl btn-gradient text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next Question
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mini progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-primary/50 transition-all duration-500"
              style={{ width: `${totalQ > 0 ? (answeredCount / totalQ) * 100 : 0}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[10px] text-white/30">
            {answeredCount}/{totalQ}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}
