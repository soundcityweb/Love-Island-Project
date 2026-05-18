"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { VotingEventsTable } from "@/components/admin/voting-events-table"
import type { VotingEvent } from "./types"
import type { CreateEventFormValues } from "@/components/admin/create-event-form"

/**
 * Wrapper that will fetch events from the backend.
 * API integration is not implemented yet; events and loading are placeholder state.
 */
const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "http://localhost:4000"

/** Replace ISO date strings in API error messages with local time so they match the list. */
function formatMessageWithLocalDates(message: string): string {
  const isoPattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?/g
  return message.replace(isoPattern, (iso) => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  })
}

export function VotingEventsWrapper() {
  const router = useRouter()
  const [events, setEvents] = useState<VotingEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/votes/periods`, { cache: "no-store" })
      if (!res.ok) {
        console.error("[VotingEventsWrapper] Failed to load voting periods", res.status)
        setEvents([])
        return
      }
      const data = await res.json()
      const periods = Array.isArray(data) ? data : []
      setEvents(periods as VotingEvent[])
    } catch (err) {
      console.error("[VotingEventsWrapper] Error loading voting periods", err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleCreateNew = () => {
    // Placeholder: will open create modal or navigate to create page.
  }

  const handleOpen = useCallback(
    async (eventId: string) => {
      try {
        const res = await fetch(`/api/admin/voting-events/${eventId}/open`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message =
            typeof data.message === "string" ? data.message : "Failed to open voting event"
          toast.error(formatMessageWithLocalDates(message))
          return
        }
        await loadEvents()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to open voting event"
        toast.error(formatMessageWithLocalDates(message))
      }
    },
    [loadEvents],
  )

  const [closingEventId, setClosingEventId] = useState<string | null>(null)

  const handleClose = useCallback(
    async (eventId: string): Promise<void> => {
      setClosingEventId(eventId)
      try {
        const res = await fetch(`/api/admin/voting-events/${eventId}/close`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message =
            typeof data.message === "string" ? data.message : "Failed to close voting event"
          throw new Error(formatMessageWithLocalDates(message))
        }
        setEvents((prev) =>
          prev.map((ev) => (ev.id === eventId ? { ...ev, status: "closed" as const } : ev)),
        )
        toast.success("Voting event closed.")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to close voting event")
        throw err
      } finally {
        setClosingEventId(null)
      }
    },
    [],
  )

  const handleViewResults = (_eventId: string) => {
    // Placeholder: will pass eventId to results page when API is wired
    router.push("/admin/results")
  }

  const handleEdit = (_eventId: string) => {
    // Edit dialog is opened by table (Edit Event menu item)
  }

  const handleSubmitEdit = useCallback(
    async (
      eventId: string,
      values: { name: string; description: string; startsAt: string; endsAt: string; resultsPublic: boolean },
    ) => {
      const res = await fetch(`/api/admin/voting-events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description?.trim() || undefined,
          startsAt: values.startsAt,
          endsAt: values.endsAt,
          resultsPublic: values.resultsPublic,
        }),
      })
      const data = await res.json().catch(() => ({} as Partial<VotingEvent> & { message?: string | string[] }))

      if (!res.ok) {
        const message =
          typeof data.message === "string"
            ? data.message
            : Array.isArray(data.message)
              ? data.message.join(", ")
              : "Failed to update voting event"
        throw new Error(message)
      }

      // Optimistically update just this event in local state (no full list refetch).
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                name: data.name ?? ev.name,
                status: (data as any).status ?? ev.status,
                startsAt: (data as any).startsAt ?? ev.startsAt,
                endsAt: (data as any).endsAt ?? ev.endsAt,
                resultsPublic: data.resultsPublic ?? ev.resultsPublic,
                updatedAt: (data as any).updatedAt ?? ev.updatedAt,
              }
            : ev,
        ),
      )
    },
    [setEvents],
  )

  const handleAddContestants = (_eventId: string) => {
    // Placeholder: attach dialog is opened by table (Attach Islanders menu item)
  }

  const handleAttachContestants = useCallback(
    async (eventId: string, islanderIds: string[]) => {
      const res = await fetch(`/api/admin/voting-events/${eventId}/contestants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ islanderIds }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message =
          typeof data.message === "string" ? data.message : "Failed to attach contestants"
        throw new Error(message)
      }
      await loadEvents()
    },
    [loadEvents],
  )

  const createVotingEvent = useCallback(async (values: CreateEventFormValues) => {
    const res = await fetch("/api/admin/voting-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: values.code,
        name: values.name,
        description: values.description?.trim() || undefined,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const message = typeof data.message === "string" ? data.message : "Failed to create voting event"
      throw new Error(message)
    }
  }, [])

  const handleSubmitCreate = useCallback(
    async (values: CreateEventFormValues) => {
      await createVotingEvent(values)
      await loadEvents()
    },
    [createVotingEvent, loadEvents]
  )

  return (
    <VotingEventsTable
      events={events}
      loading={loading}
      closingEventId={closingEventId}
      onCreateNew={handleCreateNew}
      onSubmitCreate={handleSubmitCreate}
      onOpen={handleOpen}
      onClose={handleClose}
      onViewResults={handleViewResults}
      onEdit={handleEdit}
      onAddContestants={handleAddContestants}
      onAttachContestants={handleAttachContestants}
      onSubmitEdit={handleSubmitEdit}
    />
  )
}
