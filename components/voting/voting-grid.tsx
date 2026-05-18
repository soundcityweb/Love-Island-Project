"use client"

import { useRef, useEffect } from "react"
import { VoteCard } from "@/components/voting/vote-card"
import { VoteShareButtons } from "@/components/voting/vote-share-buttons"
import type { Contestant, VotingStatus } from "@/components/voting/types"
import { Sparkles, Lock, Hourglass, Loader2 } from "lucide-react"

export interface VotingGridProps {
  contestants: Contestant[]
  selectedId: string | null
  status: VotingStatus
  isVoteDisabled: boolean
  errorMessage: string | null
  /** When true, show the "Voting is closed" banner (e.g. event ended). */
  isClosed?: boolean
  /** No period from API — copy differs from post-event "closed". */
  noActiveEvent?: boolean
  /** Draft admin preview: same layout as live vote; selection works; submit is disabled. */
  previewMode?: boolean
  /** Client countdown reached event end — show “Voting has ended”. */
  voteEndedByTimer?: boolean
  onSelect: (id: string | null) => void
  onSubmitVote: () => void
  onDismissSuccess?: () => void
  onDismissError?: () => void
}

export function VotingGrid({
  contestants,
  selectedId,
  status,
  isVoteDisabled,
  errorMessage,
  onSelect,
  onSubmitVote,
  isClosed = false,
  noActiveEvent = false,
  previewMode = false,
  voteEndedByTimer = false,
  onDismissSuccess,
  onDismissError,
}: VotingGridProps) {
  const feedbackRef = useRef<HTMLDivElement>(null)

  const isLoading = status === "loading"
  const isSuccess = status === "success"
  const isDuplicate = status === "duplicate"
  const isError = status === "error"
  const voteRecorded = isSuccess || isDuplicate
  const selectedContestant = contestants.find((c) => c.id === selectedId)
  const selectionLocked =
    (isVoteDisabled && !previewMode) || voteRecorded
  const submitBlocked = previewMode || isVoteDisabled

  useEffect(() => {
    if (!feedbackRef.current) return
    if (isSuccess || isDuplicate || (isError && errorMessage)) {
      const id = requestAnimationFrame(() => {
        feedbackRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      })
      return () => cancelAnimationFrame(id)
    }
  }, [isSuccess, isDuplicate, isError, errorMessage])

  const showClosedBanner =
    isClosed && !isLoading && !isSuccess && !isDuplicate

  const showShareNearCta =
    !previewMode &&
    !isClosed &&
    !noActiveEvent &&
    !voteEndedByTimer &&
    contestants.length > 0 &&
    !voteRecorded &&
    status !== "loading"

  /** Fixed bottom bar on small screens (idle / submitting while vote still “open”). */
  const showMobileVoteBar =
    !previewMode &&
    !isClosed &&
    !noActiveEvent &&
    !voteEndedByTimer &&
    contestants.length > 0 &&
    !voteRecorded &&
    (status === "idle" || status === "loading")

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      {/* No open vote / closed — contextual banner (kept above grid) */}
      {showClosedBanner && (
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] px-6 py-12 text-center md:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,77,128,0.12),transparent)]" />
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary-foreground/25 bg-primary-foreground/[0.06]">
            {noActiveEvent ? (
              <Hourglass className="h-10 w-10 text-primary-foreground/45" strokeWidth={1.5} aria-hidden />
            ) : (
              <Lock className="h-10 w-10 text-primary-foreground/45" strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-primary-foreground/40">
            {noActiveEvent ? "Stand by" : voteEndedByTimer ? "Time's up" : "Lines closed"}
          </p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-primary-foreground md:text-3xl">
            {noActiveEvent
              ? "No vote is live right now"
              : voteEndedByTimer
                ? "Voting has ended"
                : "Voting is closed"}
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-base leading-relaxed text-primary-foreground/55">
            {noActiveEvent ? (
              <>
                There isn&apos;t an open voting window at the moment. When the
                next eviction vote is announced, you&apos;ll be able to save
                your favourite islander right here — stay tuned.
              </>
            ) : voteEndedByTimer ? (
              <>
                The voting window for this event is closed. Thank you for taking
                part — results will follow the show.
              </>
            ) : (
              <>
                This window has slammed shut — for now. Stay glued to the show
                for the next eviction vote and another chance to change
                someone&apos;s fate.
              </>
            )}
          </p>
          <div className="mx-auto mt-8 h-px max-w-xs bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent" />
        </div>
      )}

      {/* Contestant grid — single column on small phones, 2 cols tablet, 3 desktop */}
      <div
        className={`grid grid-cols-1 gap-3 transition-opacity duration-500 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-6 ${
          isClosed && !isSuccess && !isDuplicate ? "opacity-50" : "opacity-100"
        }`}
      >
        {contestants.map((contestant, index) => (
          <VoteCard
            key={contestant.id}
            contestant={contestant}
            isSelected={selectedId === contestant.id}
            isDisabled={selectionLocked}
            imagePriority={index < 2}
            onSelect={() => {
              if (!selectionLocked) {
                onSelect(selectedId === contestant.id ? null : contestant.id)
              }
            }}
          />
        ))}
      </div>

      {/* Submit feedback — next to voting action; scroll target */}
      <div
        ref={feedbackRef}
        className="scroll-mt-24 md:scroll-mt-28"
        aria-live={isSuccess || isDuplicate || (isError && errorMessage) ? "assertive" : "polite"}
      >
        {isLoading && (
          <div
            className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 px-4 py-6 text-center shadow-warm sm:mt-8 sm:flex-row sm:gap-4 sm:px-6 sm:py-6"
            role="status"
          >
            <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/25 sm:mb-0">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-black text-primary-foreground">Locking in your vote…</h3>
              <p className="mt-1 text-sm text-primary-foreground/60">The villa is watching. Please wait.</p>
            </div>
          </div>
        )}

        {isSuccess && !isLoading && (
          <div
            className="mt-5 overflow-hidden rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-6 text-center shadow-warm-lg sm:mt-8 sm:px-6 sm:py-8 md:px-10"
            role="alert"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <Sparkles className="h-7 w-7 text-emerald-300" strokeWidth={2} aria-hidden />
            </div>
            <h3 className="text-xl font-black tracking-tight text-emerald-100 md:text-2xl">
              Your vote has been recorded
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-100/80">
              Thank you for{" "}
              <span className="font-black text-emerald-200">
                {selectedContestant?.name ?? "your choice"}
              </span>
              .
            </p>
            <VoteShareButtons variant="afterVote" tone="success" />
            {onDismissSuccess && (
              <button
                type="button"
                onClick={onDismissSuccess}
                className="mt-6 inline-flex rounded-full border border-emerald-400/30 px-6 py-2.5 text-sm font-bold text-emerald-100 transition-colors hover:bg-emerald-500/15"
              >
                Done
              </button>
            )}
          </div>
        )}

        {isDuplicate && !isLoading && (
          <div
            className="mt-5 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-6 text-center sm:mt-8 sm:px-6 sm:py-8"
            role="alert"
          >
            <h3 className="text-xl font-bold text-red-200">You have already voted</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-red-100/75">
              Only one vote per person for this event. Thanks for taking part.
            </p>
            <VoteShareButtons variant="afterVote" tone="duplicate" />
          </div>
        )}

        {isError && errorMessage && !isDuplicate && (
          <div
            className="mt-5 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-6 text-center sm:mt-8 sm:px-6 sm:py-8"
            role="alert"
          >
            <h3 className="text-xl font-bold text-red-200">Something went wrong</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-red-100/80">{errorMessage}</p>
            {onDismissError && (
              <button
                type="button"
                onClick={onDismissError}
                className="mt-6 inline-flex rounded-full border border-red-400/30 px-5 py-2.5 text-sm font-bold text-red-100 transition-colors hover:bg-red-500/15"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Keeps last content clear of the fixed mobile vote bar */}
      {showMobileVoteBar && (
        <div
          className="h-[calc(5.5rem+env(safe-area-inset-bottom,0px))] shrink-0 md:hidden"
          aria-hidden
        />
      )}

      {/* Vote action bar — pinned to bottom on small screens while voting */}
      <div
        className={`mt-5 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between md:mt-10 ${
          showMobileVoteBar
            ? "max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-40 max-md:mt-0 max-md:border-t max-md:border-primary-foreground/10 max-md:bg-foreground/95 max-md:px-4 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:pt-3 max-md:shadow-[0_-12px_48px_rgba(0,0,0,0.45)] max-md:backdrop-blur-md"
            : ""
        }`}
      >
        <div className="text-center sm:min-w-0 sm:flex-1 sm:text-left">
          {(previewMode || !isVoteDisabled) &&
            status === "idle" &&
            !voteRecorded && (
              selectedId ? (
                <p className="text-sm font-medium text-primary-foreground/80">
                  You&apos;re backing{" "}
                  <span className="font-black text-primary">
                    {selectedContestant?.name}
                  </span>{" "}
                  — tap submit to make it count.
                </p>
              ) : (
                <p className="text-sm text-primary-foreground/45">
                  Pick an islander — then seal it with your vote.
                </p>
              )
            )}
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {(status === "idle" ||
            status === "loading" ||
            status === "success" ||
            status === "duplicate") && (
            <button
              type="button"
              onClick={onSubmitVote}
              disabled={
                previewMode ||
                status === "loading" ||
                status === "success" ||
                status === "duplicate" ||
                isVoteDisabled ||
                (status === "idle" && !selectedId)
              }
              className={`relative min-h-[48px] w-full min-w-0 overflow-hidden rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-wide transition-all sm:min-h-[44px] sm:w-auto sm:min-w-[10rem] sm:px-8 sm:py-3 ${
                status === "loading"
                  ? "cursor-wait border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/70"
                  : voteRecorded
                    ? "cursor-default border border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                    : selectedId && !submitBlocked
                      ? "btn-gradient text-white shadow-warm hover:brightness-110"
                      : "cursor-not-allowed bg-primary-foreground/10 text-primary-foreground/30"
              }`}
            >
              {status === "loading" ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  Submitting…
                </span>
              ) : voteRecorded ? (
                "Voted"
              ) : selectedId ? (
                "Submit vote"
              ) : (
                "Select to vote"
              )}
            </button>
          )}

          {isVoteDisabled && status === "idle" && !isClosed && !previewMode && !voteRecorded && (
            <p className="text-center text-sm text-primary-foreground/40 sm:text-left">
              Voting is not available
            </p>
          )}
        </div>
      </div>

      {showShareNearCta && (
        <div className="mt-8">
          <VoteShareButtons variant="compact" />
        </div>
      )}
    </div>
  )
}
