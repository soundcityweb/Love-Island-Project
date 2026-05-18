"use client"

/**
 * Quiz — a generic, reusable multi-question quiz component.
 *
 * The component owns internal UI state (currentIndex, answers).
 * It is fully decoupled from any API: the parent handles submission
 * via the `onSubmit` callback and controls loading/error feedback
 * through the `isSubmitting` and `error` props.
 *
 * Usage:
 *   <Quiz
 *     questions={[{ id: "q1", question: "Who left the villa?", options: ["Ayo", "Bolu", "Cam"] }]}
 *     onSubmit={(answers) => api.post("/submit", answers)}
 *     isSubmitting={posting}
 *     error={apiError}
 *   />
 */

import { useState, useCallback, useRef, useId } from "react"
import { cn } from "@/lib/utils"

// ── Public types ──────────────────────────────────────────────────────────────

export interface QuizQuestion {
  /** Stable identifier — used as the key in the answers map. */
  id: string
  question: string
  /**
   * Answer options displayed as selectable buttons.
   * Between 2 and 6 options are supported.
   */
  options: string[]
}

export interface QuizProps {
  questions: QuizQuestion[]
  /**
   * Called when the user hits Submit.
   * Receives a map of { [questionId]: selectedOption }.
   * The function may be async; the component will not disable
   * the button again once called — use `isSubmitting` for that.
   */
  onSubmit: (answers: Record<string, string>) => void | Promise<void>
  /** Set true while the parent is processing the submission. */
  isSubmitting?: boolean
  /** An error string shown below the nav controls. */
  error?: string | null
  /** Label shown on the final submit button. Defaults to "Submit Answers". */
  submitLabel?: string
  /**
   * When true, allows navigating past an unanswered question without
   * selecting an option first.  The submit button remains disabled
   * until all questions are answered regardless of this setting.
   * Defaults to false.
   */
  allowSkip?: boolean
  className?: string
}

// ── Internal constants ────────────────────────────────────────────────────────

const LETTER = ["A", "B", "C", "D", "E", "F"] as const

// ── Sub-components ────────────────────────────────────────────────────────────

interface ProgressBarProps {
  current: number  // 0-based index of the current question
  total: number
  answered: number
}

function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0

  return (
    <div className="space-y-2" aria-hidden="true">
      {/* Continuous fill bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF4D80] to-[#FF7A17] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Segmented dot track — one segment per question */}
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < current  ? "bg-primary/50"
              : i === current ? "bg-primary"
              : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface OptionButtonProps {
  letter: string
  text: string
  selected: boolean
  disabled: boolean
  onClick: () => void
  questionId: string
  index: number
}

function OptionButton({
  letter,
  text,
  selected,
  disabled,
  onClick,
  questionId,
  index,
}: OptionButtonProps) {
  const inputId = `quiz-${questionId}-option-${index}`

  return (
    <label
      htmlFor={inputId}
      className={cn(
        // Base layout
        "group flex cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-3.5 transition-all duration-150 active:scale-[0.99]",
        // State classes
        selected
          ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_rgba(255,77,128,0.25)]"
          : disabled
            ? "cursor-not-allowed border-white/8 bg-white/[0.03] opacity-55"
            : "border-white/10 bg-white/5 hover:border-white/22 hover:bg-white/8",
      )}
    >
      {/* Hidden real radio for accessibility */}
      <input
        type="radio"
        id={inputId}
        name={`quiz-${questionId}`}
        value={text}
        checked={selected}
        disabled={disabled}
        onChange={onClick}
        className="sr-only"
      />

      {/* Letter badge */}
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors",
          selected
            ? "bg-primary/30 text-primary"
            : "bg-white/8 text-white/45 group-hover:bg-white/12 group-hover:text-white/70",
        )}
      >
        {letter}
      </span>

      {/* Option text */}
      <span
        className={cn(
          "flex-1 text-sm font-medium leading-snug",
          selected ? "text-white" : "text-white/70 group-hover:text-white/90",
        )}
      >
        {text}
      </span>

      {/* Custom radio indicator */}
      <span
        aria-hidden="true"
        className={cn(
          "h-4 w-4 shrink-0 rounded-full border-2 transition-all",
          selected ? "border-primary bg-primary/25" : "border-white/20",
        )}
      />
    </label>
  )
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export function Quiz({
  questions,
  onSubmit,
  isSubmitting = false,
  error = null,
  submitLabel = "Submit Answers",
  allowSkip = false,
  className,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // answers maps question array index → selected option text
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const questionRef = useRef<HTMLDivElement>(null)
  const headingId = useId()

  const total         = questions.length
  const currentQ      = questions[currentIndex]
  const selectedAnswer = answers[currentIndex] ?? null
  const answeredCount = Object.keys(answers).length
  const allAnswered   = answeredCount === total
  const isLastQ       = currentIndex === total - 1
  const canGoNext     = allowSkip || !!selectedAnswer

  function scrollToQuestion() {
    questionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  function goTo(index: number) {
    if (index < 0 || index >= total) return
    setCurrentIndex(index)
    scrollToQuestion()
  }

  function selectOption(opt: string) {
    if (isSubmitting) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }))
  }

  const handleSubmit = useCallback(() => {
    if (!allAnswered || isSubmitting) return
    const answerMap: Record<string, string> = {}
    questions.forEach((q, i) => {
      answerMap[q.id] = answers[i] ?? ""
    })
    void onSubmit(answerMap)
  }, [allAnswered, isSubmitting, questions, answers, onSubmit])

  if (total === 0) return null

  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      aria-label="Quiz"
      role="form"
    >
      {/* ── Header: question counter + progress ──────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p
            id={headingId}
            className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/40"
          >
            Question {currentIndex + 1} <span className="text-white/20">/ {total}</span>
          </p>
          <p className="font-mono text-[11px] font-bold text-primary/70">
            {answeredCount}/{total} answered
          </p>
        </div>
        <ProgressBar current={currentIndex} total={total} answered={answeredCount} />
      </div>

      {/* ── Question card ─────────────────────────────────────────────── */}
      <div
        ref={questionRef}
        className="scroll-mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6"
        aria-labelledby={headingId}
      >
        <p className="mb-5 text-base font-bold leading-snug text-white sm:text-lg">
          {currentQ.question}
        </p>

        <div className="space-y-2.5" role="radiogroup" aria-label={currentQ.question}>
          {currentQ.options.map((opt, oi) => (
            <OptionButton
              key={oi}
              questionId={currentQ.id}
              index={oi}
              letter={LETTER[oi] ?? String(oi + 1)}
              text={opt}
              selected={selectedAnswer === opt}
              disabled={isSubmitting}
              onClick={() => selectOption(opt)}
            />
          ))}
        </div>
      </div>

      {/* ── Error feedback from parent ────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Navigation controls ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {/* Previous */}
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0 || isSubmitting}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous question"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Step dots — tap to jump */}
        <div className="flex items-center gap-1.5" aria-label="Question navigation">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => goTo(i)}
              disabled={isSubmitting}
              aria-label={`Go to question ${i + 1}${answers[i] ? " (answered)" : ""}`}
              aria-current={i === currentIndex ? "step" : undefined}
              className={cn(
                "h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                i === currentIndex
                  ? "w-5 bg-primary"
                  : answers[i] !== undefined
                    ? "w-2 bg-primary/40 hover:bg-primary/60"
                    : "w-2 bg-white/15 hover:bg-white/30",
              )}
            />
          ))}
        </div>

        {/* Next or Submit */}
        {isLastQ ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-all",
              allAnswered && !isSubmitting
                ? "btn-gradient shadow-warm hover:-translate-y-px hover:brightness-110"
                : "cursor-not-allowed bg-white/10 opacity-40",
            )}
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                <span>Submitting…</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <CheckIcon className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={!canGoNext || isSubmitting}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-all",
              canGoNext && !isSubmitting
                ? "btn-gradient shadow-warm hover:-translate-y-px"
                : "cursor-not-allowed bg-white/10 opacity-40",
            )}
            aria-label="Next question"
          >
            <span>Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Spacer for mobile sticky bars in parent layouts ──────────── */}
      <MobileStickyBar
        isLastQ={isLastQ}
        canGoNext={canGoNext}
        allAnswered={allAnswered}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        answeredCount={answeredCount}
        total={total}
        onPrev={() => goTo(currentIndex - 1)}
        onNext={() => goTo(currentIndex + 1)}
        onSubmit={handleSubmit}
        prevDisabled={currentIndex === 0}
      />
    </div>
  )
}

// ── Mobile sticky bar ─────────────────────────────────────────────────────────

interface MobileStickyBarProps {
  isLastQ: boolean
  canGoNext: boolean
  allAnswered: boolean
  isSubmitting: boolean
  submitLabel: string
  answeredCount: number
  total: number
  prevDisabled: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

function MobileStickyBar({
  isLastQ,
  canGoNext,
  allAnswered,
  isSubmitting,
  submitLabel,
  answeredCount,
  total,
  prevDisabled,
  onPrev,
  onNext,
  onSubmit,
}: MobileStickyBarProps) {
  return (
    <>
      {/* Spacer so last card doesn't hide under the bar */}
      <div className="h-[5.5rem] md:hidden" aria-hidden />

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-foreground/96 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          {/* Prev */}
          <button
            type="button"
            onClick={onPrev}
            disabled={prevDisabled || isSubmitting}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 transition-colors hover:bg-white/10 disabled:opacity-30"
            aria-label="Previous question"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          {/* Next / Submit */}
          {isLastQ ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!allAnswered || isSubmitting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl btn-gradient text-sm font-bold text-white shadow-warm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                submitLabel
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl btn-gradient text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mini progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-primary/50 transition-all duration-500"
              style={{ width: `${total > 0 ? (answeredCount / total) * 100 : 0}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/30">
            {answeredCount}/{total}
          </span>
        </div>
      </div>
    </>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
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
