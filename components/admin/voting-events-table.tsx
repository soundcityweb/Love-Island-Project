"use client"

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AttachIslandersDialog } from "@/components/admin/attach-islanders-dialog"
import { CreateEventForm, type CreateEventFormValues } from "@/components/admin/create-event-form"
import { EditEventForm } from "@/components/admin/edit-event-form"
import type { VotingEvent } from "@/app/admin/(shell)/voting/types"

// ----- Props ----- //

export interface VotingEventsTableProps {
  events: VotingEvent[]
  loading?: boolean
  /** Set while a close request is in progress; used to disable Close button and confirm dialog button. */
  closingEventId?: string | null
  onCreateNew?: () => void
  /** Called when create form is submitted with valid values. Can be async. */
  onSubmitCreate?: (values: CreateEventFormValues) => void | Promise<void>
  onOpen?: (eventId: string) => void
  onClose?: (eventId: string) => void | Promise<void>
  onViewResults?: (eventId: string) => void
  onEdit?: (eventId: string) => void
  onAddContestants?: (eventId: string) => void
  /** Called when user confirms attach islanders in the dialog. No backend call in dialog. */
  onAttachContestants?: (eventId: string, islanderIds: string[]) => void | Promise<void>
  /** Called when edit form is saved. No API call inside form. */
  onSubmitEdit?: (eventId: string, values: { name: string; description: string; startsAt: string; endsAt: string; resultsPublic: boolean }) => void | Promise<void>
}

// ----- Helpers ----- //

function statusDisplay(status: VotingEvent["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusBadgeClasses(status: VotingEvent["status"]) {
  switch (status) {
    case "draft":
      return "border-muted-foreground/30 bg-muted text-muted-foreground"
    case "open":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "closed":
      return "border-red-200 bg-red-50 text-red-700"
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatVotes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

// ----- Icons ----- //

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  )
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
}

// ----- Stats ----- //

function VotingStats({
  total,
  draft,
  open,
  closed,
}: {
  total: number
  draft: number
  open: number
  closed: number
}) {
  const cards = [
    { label: "Total Events", value: total, accent: "bg-foreground/5 text-foreground" },
    { label: "Draft", value: draft, accent: "bg-muted text-muted-foreground" },
    { label: "Open", value: open, accent: "bg-emerald-50 text-emerald-700" },
    { label: "Closed", value: closed, accent: "bg-red-50 text-red-700" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card px-5 py-4"
        >
          <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-card-foreground">
              {card.value}
            </span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${card.accent}`}>
              {card.label.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ----- Main Component ----- //

export function VotingEventsTable({
  events,
  loading = false,
  closingEventId = null,
  onCreateNew,
  onSubmitCreate,
  onOpen,
  onClose,
  onViewResults,
  onEdit,
  onAddContestants,
  onAttachContestants,
  onSubmitEdit,
}: VotingEventsTableProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [attachEvent, setAttachEvent] = useState<{ id: string; title: string } | null>(null)
  const [closeConfirmEvent, setCloseConfirmEvent] = useState<VotingEvent | null>(null)
  const [editEventId, setEditEventId] = useState<string | null>(null)
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null)

  const openVotePreview = useCallback(async (eventId: string) => {
    setPreviewLoadingId(eventId)
    try {
      const res = await fetch(`/api/admin/voting-events/${eventId}/preview-token`, {
        method: "POST",
      })
      const data = (await res.json().catch(() => ({}))) as {
        token?: string
        message?: string | string[]
      }
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : typeof data.message === "string"
            ? data.message
            : "Could not create preview link."
        toast.error(msg)
        return
      }
      if (!data.token) {
        toast.error("Invalid preview response.")
        return
      }
      const url = `/vote?preview=1&event=${encodeURIComponent(eventId)}&token=${encodeURIComponent(data.token)}`
      window.open(url, "_blank", "noopener,noreferrer")
    } catch {
      toast.error("Could not open preview.")
    } finally {
      setPreviewLoadingId(null)
    }
  }, [])

  const stats = useMemo(() => ({
    total: events.length,
    draft: events.filter((e) => e.status === "draft").length,
    open: events.filter((e) => e.status === "open").length,
    closed: events.filter((e) => e.status === "closed").length,
  }), [events])

  const filtered = useMemo(() => {
    let list = events
    if (activeTab !== "all") {
      const statusMap = { draft: "draft" as const, open: "open" as const, closed: "closed" as const }
      const status = statusMap[activeTab as keyof typeof statusMap]
      if (status) list = list.filter((e) => e.status === status)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
      )
    }
    return list
  }, [events, activeTab, search])

  const handleCreateNew = () => onCreateNew?.()
  const handleOpen = (id: string) => onOpen?.(id)
  const handleClose = (id: string) => onClose?.(id)
  const isClosing = (eventId: string) => closingEventId === eventId
  const handleViewResults = (id: string) => onViewResults?.(id)
  const handleEdit = (event: VotingEvent) => {
    setEditEventId(event.id)
    onEdit?.(event.id)
  }
  const handleAddContestants = (id: string) => onAddContestants?.(id)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <VotingStats
        total={stats.total}
        draft={stats.draft}
        open={stats.open}
        closed={stats.closed}
      />

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
            <TabsTrigger value="draft">
              Draft
              <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                {stats.draft}
              </span>
            </TabsTrigger>
            <TabsTrigger value="open">
              Open
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                {stats.open}
              </span>
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed
              <span className="ml-1.5 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                {stats.closed}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-60"
            />
          </div>

          {/* Create New */}
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create New Event</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={onSubmitCreate}
      />

      {/* Edit Event Modal */}
      <EditEventForm
        open={!!editEventId}
        onOpenChange={(open) => { if (!open) setEditEventId(null) }}
        eventId={editEventId}
        onSubmit={editEventId ? (values) => onSubmitEdit?.(editEventId, values) : undefined}
      />

      {/* Attach Islanders Modal */}
      <AttachIslandersDialog
        open={!!attachEvent}
        onOpenChange={(open: boolean) => { if (!open) setAttachEvent(null) }}
        eventId={attachEvent?.id ?? ""}
        eventTitle={attachEvent?.title ?? ""}
        onAttach={onAttachContestants}
      />

      {/* Close Voting Confirmation Modal */}
      <Dialog
        open={!!closeConfirmEvent}
        onOpenChange={(open) => {
          if (!open && (!closeConfirmEvent || !isClosing(closeConfirmEvent.id))) setCloseConfirmEvent(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <StopIcon className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="pt-2 text-center">
              Close Voting Event
            </DialogTitle>
            <DialogDescription className="text-center">
              You are about to close voting for:
            </DialogDescription>
          </DialogHeader>

          {closeConfirmEvent && (
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
              <p className="text-sm font-semibold text-card-foreground">
                {closeConfirmEvent.name}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{closeConfirmEvent.id}</span>
                <span>
                  {formatVotes(Number(closeConfirmEvent.totalVotes) || 0)} votes recorded
                </span>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  This action cannot be undone
                </p>
                <p className="mt-1 text-xs leading-relaxed text-red-700">
                  Once closed, fans will no longer be able to cast votes for
                  this event. All current results will be finalised. The event
                  status will permanently change to Closed.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => setCloseConfirmEvent(null)}
              disabled={closeConfirmEvent != null && isClosing(closeConfirmEvent.id)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              disabled={closeConfirmEvent != null && isClosing(closeConfirmEvent.id)}
              onClick={async () => {
                if (!closeConfirmEvent) return
                try {
                  await handleClose(closeConfirmEvent.id)
                  setCloseConfirmEvent(null)
                } catch {
                  // Error already shown by wrapper; keep dialog open
                }
              }}
            >
              {closeConfirmEvent && isClosing(closeConfirmEvent.id) ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  Closing…
                </>
              ) : (
                <>
                  <StopIcon className="h-4 w-4" />
                  Close Voting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80" role="status" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="sr-only">Loading events…</span>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Start</TableHead>
              <TableHead className="hidden md:table-cell">End</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Contestants</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Votes</TableHead>
              <TableHead className="min-w-[10.5rem] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <EmptyIcon className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No voting events</p>
                    <p className="text-xs max-w-sm">
                      {events.length === 0
                        ? "Create a new event to get started, or events will appear here once loaded from the backend."
                        : "No events match your search or filter."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {event.code || event.id.slice(0, 8)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                      <div>
                        <p className="font-medium text-card-foreground">{event.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                          {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClasses(event.status)}>
                      {event.status === "open" && (
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      )}
                      {statusDisplay(event.status)}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div>
                      <p className="text-sm text-card-foreground">{formatDate(event.startsAt)}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{formatTime(event.startsAt)}</p>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div>
                      <p className="text-sm text-card-foreground">{formatDate(event.endsAt)}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{formatTime(event.endsAt)}</p>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-right font-mono text-sm text-muted-foreground lg:table-cell">
                    {event.contestantCount ?? "—"}
                  </TableCell>

                  <TableCell className="hidden text-right lg:table-cell">
                    <span className="font-mono text-sm font-medium text-card-foreground">
                      {event.totalVotes != null && event.totalVotes > 0 ? formatVotes(event.totalVotes) : "—"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {event.status === "draft" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          disabled={previewLoadingId === event.id}
                          onClick={() => openVotePreview(event.id)}
                        >
                          {previewLoadingId === event.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                          ) : (
                            <EyeIcon className="h-3.5 w-3.5" />
                          )}
                          Preview
                        </Button>
                      )}
                      {(event.status === "draft" || event.status === "closed") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-600"
                          onClick={() => handleOpen(event.id)}
                        >
                          <PlayIcon className="h-3.5 w-3.5" />
                          Open
                        </Button>
                      )}
                      {event.status === "open" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-red-600 hover:text-red-600"
                          disabled={isClosing(event.id)}
                          onClick={() => setCloseConfirmEvent(event)}
                        >
                          {isClosing(event.id) ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                          ) : (
                            <StopIcon className="h-3.5 w-3.5" />
                          )}
                          Close
                        </Button>
                      )}
                      {event.status === "closed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => handleViewResults(event.id)}
                        >
                          <ChartIcon className="h-3.5 w-3.5" />
                          Results
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Actions for ${event.name}`}
                          >
                            <EllipsisIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(event)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit Event
                          </DropdownMenuItem>
                          {event.status === "draft" && (
                            <DropdownMenuItem
                              disabled={previewLoadingId === event.id}
                              onClick={() => openVotePreview(event.id)}
                            >
                              <EyeIcon className="mr-2 h-4 w-4" />
                              Preview vote page
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setAttachEvent({ id: event.id, title: event.name })}>
                            <UsersIcon className="mr-2 h-4 w-4" />
                            Attach Islanders
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewResults(event.id)}>
                            <ChartIcon className="mr-2 h-4 w-4" />
                            View Results
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(event.status === "draft" || event.status === "closed") && (
                            <DropdownMenuItem
                              className="text-emerald-600 focus:text-emerald-600"
                              onClick={() => handleOpen(event.id)}
                            >
                              <PlayIcon className="mr-2 h-4 w-4" />
                              Open Voting
                            </DropdownMenuItem>
                          )}
                          {event.status === "open" && (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              disabled={isClosing(event.id)}
                              onClick={() => setCloseConfirmEvent(event)}
                            >
                              <StopIcon className="mr-2 h-4 w-4" />
                              Close Voting
                            </DropdownMenuItem>
                          )}
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

      {!loading && events.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} of {events.length} event{events.length !== 1 && "s"}
        </p>
      )}
    </div>
  )
}
