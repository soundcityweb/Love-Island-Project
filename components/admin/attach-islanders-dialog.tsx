"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUploadsUrl } from "@/app/lib/api-voting"

// ----- Types ----- //

/** Islander row for the attach dialog (mapped from API visible islanders). */
export interface AttachIslanderItem {
  id: string
  name: string
  age: number
  location: string
  image: string
  status: "Active" | "Evicted"
}

/** API list item shape (GET /api/islanders returns public islanders only). */
interface IslanderListItemDto {
  id: string
  slug: string
  firstName: string
  lastName: string | null
  age: number
  location: string
  tagline: string | null
  profileImage: string | null
  profileStatusLabel: string | null
  status: string
}

function mapApiIslanderToItem(dto: IslanderListItemDto): AttachIslanderItem {
  const name = [dto.firstName, dto.lastName].filter(Boolean).join(" ").trim() || "Islander"
  const status: "Active" | "Evicted" = dto.status === "evicted" ? "Evicted" : "Active"
  return {
    id: dto.id,
    name,
    age: dto.age,
    location: dto.location,
    image: getUploadsUrl(dto.profileImage) || "/placeholder.svg",
    status,
  }
}

export interface AttachIslandersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventTitle: string
  /** Called when user confirms attach. No backend call inside dialog. */
  onAttach?: (eventId: string, islanderIds: string[]) => void | Promise<void>
}

// ----- Icons ----- //

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

// ----- Component ----- //

const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "http://localhost:4000"

export function AttachIslandersDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  onAttach,
}: AttachIslandersDialogProps) {
  const [islanders, setIslanders] = useState<AttachIslanderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [attached, setAttached] = useState(false)
  const [attachSubmitting, setAttachSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setFetchError(null)
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/islanders`, { cache: "no-store" })
        if (!res.ok) {
          setFetchError("Failed to load islanders.")
          setIslanders([])
          return
        }
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setIslanders(list.map((d: IslanderListItemDto) => mapApiIslanderToItem(d)))
      } catch {
        setFetchError("Failed to load islanders.")
        setIslanders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open])

  const filtered = useMemo(() => {
    if (!search.trim()) return islanders
    const q = search.toLowerCase()
    return islanders.filter(
      (i) => i.name.toLowerCase().includes(q) || i.location.toLowerCase().includes(q),
    )
  }, [islanders, search])

  const selectedIslanders = useMemo(
    () => islanders.filter((i) => selected.has(i.id)),
    [islanders, selected],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === filtered.length && filtered.length > 0) return new Set()
      return new Set(filtered.map((i) => i.id))
    })
  }, [filtered])

  const handleAttach = useCallback(async () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setAttachSubmitting(true)
    try {
      await onAttach?.(eventId, ids)
      setAttached(true)
    } catch {
      // Caller can show toast; keep dialog open
    } finally {
      setAttachSubmitting(false)
    }
  }, [eventId, selected, onAttach])

  const resetAndClose = useCallback(() => {
    onOpenChange(false)
    setTimeout(() => {
      setSelected(new Set())
      setSearch("")
      setAttached(false)
      setFetchError(null)
    }, 200)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) resetAndClose(); }}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-3xl">
        {/* Header */}
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <UsersIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Attach Islanders</DialogTitle>
              <DialogDescription className="mt-0.5">
                Select contestants to add to <span className="font-semibold text-foreground">{eventTitle}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Success state */}
        {attached ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckIcon className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-card-foreground">
                {selectedIslanders.length} {selectedIslanders.length === 1 ? "Islander" : "Islanders"} Attached
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Successfully added to {eventTitle}
              </p>
            </div>
            {/* Avatars preview */}
            <div className="flex -space-x-2">
              {selectedIslanders.slice(0, 5).map((islander) => (
                <div key={islander.id} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-card">
                  <Image
                    src={islander.image}
                    alt={islander.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {selectedIslanders.length > 5 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-bold text-muted-foreground">
                  +{selectedIslanders.length - 5}
                </div>
              )}
            </div>
            <Button onClick={resetAndClose} className="mt-4">
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Body -- two columns */}
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* Left: Available islanders list */}
              <div className="flex min-h-0 flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
                {/* Search + select all toolbar */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search islanders..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    disabled={loading}
                    className="whitespace-nowrap text-xs font-semibold text-primary hover:text-primary/80 disabled:opacity-50"
                  >
                    {selected.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: "360px" }}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
                      <p className="mt-3 text-sm text-muted-foreground">Loading islanders…</p>
                    </div>
                  ) : fetchError ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <p className="text-sm text-destructive">{fetchError}</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">No islanders match your search.</p>
                    </div>
                  ) : (
                    <ul role="listbox" aria-label="Available islanders" className="divide-y divide-border">
                      {filtered.map((islander) => {
                        const isChecked = selected.has(islander.id)
                        const handleToggle = () => toggleSelect(islander.id)
                        return (
                          <li key={islander.id} role="option" aria-selected={isChecked}>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={handleToggle}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  handleToggle()
                                }
                              }}
                              className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                                isChecked ? "bg-primary/5" : ""
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={handleToggle}
                                aria-label={`Select ${islander.name}`}
                                className="pointer-events-none"
                              />
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={islander.image}
                                  alt={islander.name}
                                  width={40}
                                  height={40}
                                  className={`h-full w-full object-cover ${islander.status === "Evicted" ? "grayscale" : ""}`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-card-foreground">
                                  {islander.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {islander.age} &middot; {islander.location}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  islander.status === "Active"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                                }
                              >
                                {islander.status}
                              </Badge>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right: Selected preview */}
              <div className="flex w-full flex-col lg:w-72">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Selected
                    <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                      {selected.size}
                    </span>
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ maxHeight: "360px" }}>
                  {selectedIslanders.length === 0 ? (
                    <div className="flex flex-col items-center px-4 py-12 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UsersIcon className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        No islanders selected
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        Select from the list to add contestants
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {selectedIslanders.map((islander) => (
                        <li key={islander.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                            <Image
                              src={islander.image}
                              alt={islander.name}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-card-foreground">
                              {islander.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelect(islander.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove ${islander.name}`}
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Footer actions */}
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selected.size}</span>{" "}
                {selected.size === 1 ? "islander" : "islanders"} selected
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-transparent" onClick={resetAndClose}>
                  Cancel
                </Button>
                <Button
                  disabled={selected.size === 0 || attachSubmitting}
                  onClick={handleAttach}
                  className="gap-2"
                >
                  {attachSubmitting ? (
                    <>
                      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                      Attaching…
                    </>
                  ) : (
                    "Attach Selected"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
