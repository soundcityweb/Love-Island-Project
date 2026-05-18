"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { VotingGrid } from "@/components/voting/voting-grid"
import type { Contestant, VotingStatus } from "@/components/voting/types"
import type { VotingEvent } from "@/app/lib/api-voting"
import {
  fetchCurrentVotingEvent,
  fetchContestants,
  fetchDraftPreview,
  submitVote,
  mapContestantToUI,
} from "@/app/lib/api-voting"
import { VoteEndsCountdown } from "@/components/voting/vote-ends-countdown"

const SESSION_ID_KEY = "love-island-vote-session-id"

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = crypto.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}

export interface VotingGridPreviewConfig {
  eventId: string
  token: string
}

export interface VotingGridWrapperProps {
  /** When set, loads draft event via signed token; submit does not call the API. */
  preview?: VotingGridPreviewConfig | null
  /** True when ?preview=1 was used but event id or token is missing. */
  previewLinkInvalid?: boolean
}

export function VotingGridWrapper({
  preview = null,
  previewLinkInvalid = false,
}: VotingGridWrapperProps) {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<VotingStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isVoteDisabled, setIsVoteDisabled] = useState(true)
  const [isClosed, setIsClosed] = useState(false)
  /** API returned no current period (no open voting window). */
  const [noActiveEvent, setNoActiveEvent] = useState(false)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [liveEvent, setLiveEvent] = useState<VotingEvent | null>(null)
  const [serverOffsetMs, setServerOffsetMs] = useState(0)
  const [voteEndedByTimer, setVoteEndedByTimer] = useState(false)
  const isPreview = Boolean(preview)

  const onVoteTimerExpired = useCallback(() => {
    setVoteEndedByTimer(true)
    setIsClosed(true)
    setIsVoteDisabled(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (previewLinkInvalid) {
      setIsLoadingEvent(false)
      setLiveEvent(null)
      setNoActiveEvent(true)
      setIsClosed(true)
      setIsVoteDisabled(true)
      setContestants([])
      setErrorMessage(null)
      return
    }

    async function loadLive() {
      setIsLoadingEvent(true)
      try {
        const data = await fetchCurrentVotingEvent()
        if (cancelled) return
        const event = data.period
        setServerOffsetMs(data.offsetMs)
        setVoteEndedByTimer(false)
        if (!event) {
          setLiveEvent(null)
          setNoActiveEvent(true)
          setIsClosed(true)
          setIsVoteDisabled(true)
          setContestants([])
          return
        }
        setLiveEvent(event)
        setNoActiveEvent(false)
        const open = event.status === "open"
        const nowSynced = Date.now() + data.offsetMs
        const endMs = new Date(event.endsAt).getTime()
        const pastEnd = endMs <= nowSynced
        if (pastEnd && open) {
          setVoteEndedByTimer(true)
          setIsClosed(true)
          setIsVoteDisabled(true)
        } else {
          setIsVoteDisabled(!open)
          setIsClosed(!open)
        }
        const list = await fetchContestants(event.id)
        if (cancelled) return
        setContestants(list.map(mapContestantToUI))
      } catch {
        if (!cancelled) {
          setLiveEvent(null)
          setIsVoteDisabled(true)
          setErrorMessage("Failed to load voting. Please try again later.")
        }
      } finally {
        if (!cancelled) setIsLoadingEvent(false)
      }
    }

    async function loadPreview() {
      if (!preview) return
      setIsLoadingEvent(true)
      try {
        const data = await fetchDraftPreview(preview.eventId, preview.token)
        if (cancelled) return
        setLiveEvent(data.event)
        setServerOffsetMs(0)
        setVoteEndedByTimer(false)
        setNoActiveEvent(false)
        setIsClosed(false)
        setIsVoteDisabled(false)
        setContestants(data.contestants.map(mapContestantToUI))
        setErrorMessage(null)
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load preview."
          setErrorMessage(message)
          setContestants([])
          setLiveEvent(null)
          setNoActiveEvent(false)
          setIsClosed(false)
          setIsVoteDisabled(true)
          setStatus("error")
        }
      } finally {
        if (!cancelled) setIsLoadingEvent(false)
      }
    }

    if (preview) {
      loadPreview()
    } else {
      loadLive()
    }

    return () => {
      cancelled = true
    }
  }, [preview, preview?.eventId, preview?.token, previewLinkInvalid])

  const handleSubmitVote = useCallback(async () => {
    if (
      isPreview ||
      !selectedId ||
      isVoteDisabled ||
      status === "success" ||
      status === "duplicate"
    ) {
      return
    }
    setStatus("loading")
    setErrorMessage(null)
    try {
      const sessionId = getOrCreateSessionId()
      await submitVote(selectedId, sessionId)
      setStatus("success")
      toast.success("Your vote has been recorded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."

      if (message === "You have already voted.") {
        setStatus("duplicate")
        toast.error("You have already voted")
        return
      }

      if (
        message === "Voting is not open." ||
        message === "Voting is not open at this time." ||
        message === "No active voting event."
      ) {
        setIsClosed(true)
        setIsVoteDisabled(true)
        setStatus("idle")
        setErrorMessage(null)
        return
      }

      setStatus("error")
      setErrorMessage(message)
    }
  }, [selectedId, isVoteDisabled, status, isPreview])

  const handleDismissError = useCallback(() => {
    setErrorMessage(null)
    setStatus("idle")
  }, [])

  const effectiveVoteDisabled =
    isVoteDisabled || status === "success" || status === "duplicate"

  const showCountdown =
    !isPreview &&
    !isLoadingEvent &&
    liveEvent &&
    liveEvent.status === "open" &&
    !voteEndedByTimer &&
    !noActiveEvent

  if (previewLinkInvalid) {
    return (
      <div
        className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] px-6 py-12 text-center"
        role="alert"
      >
        <p className="text-lg font-bold text-primary-foreground">Invalid preview link</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/55">
          Open Preview again from the admin voting event (draft only). The link must include the
          event id and token.
        </p>
      </div>
    )
  }

  if (isLoadingEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20" role="status" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-primary-foreground/60">Loading voting…</p>
      </div>
    )
  }

  return (
    <div>
      {showCountdown && (
        <VoteEndsCountdown
          endsAtIso={liveEvent!.endsAt}
          offsetMs={serverOffsetMs}
          onExpired={onVoteTimerExpired}
          hidden={status === "success" || status === "duplicate"}
        />
      )}
      <VotingGrid
        contestants={contestants}
        selectedId={selectedId}
        status={status}
        isVoteDisabled={effectiveVoteDisabled}
        errorMessage={errorMessage}
        isClosed={isClosed}
        noActiveEvent={noActiveEvent}
        previewMode={isPreview}
        voteEndedByTimer={voteEndedByTimer}
        onSelect={setSelectedId}
        onSubmitVote={handleSubmitVote}
        onDismissError={handleDismissError}
      />
    </div>
  )
}
