"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Download, RefreshCw } from "lucide-react"

import type { ContactListItem, ContactListResponse, ContactMessageStatus } from "@/app/lib/admin-contact-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { value: ContactMessageStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
]

const SUBJECT_LABELS: Record<string, string> = {
  general_inquiry: "General",
  support: "Support",
  partnerships: "Partnerships",
  media: "Media",
  other: "Other",
}

function formatSubject(s: string) {
  return SUBJECT_LABELS[s] ?? s
}

function formatStatus(s: ContactMessageStatus) {
  switch (s) {
    case "new":
      return "New"
    case "in_progress":
      return "In progress"
    case "resolved":
      return "Resolved"
    default:
      return s
  }
}

export function ContactMessagesAdmin() {
  const [status, setStatus] = useState<ContactMessageStatus | "all">("all")
  const [q, setQ] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ContactListItem[]>([])
  const [total, setTotal] = useState(0)
  const [refetchN, setRefetchN] = useState(0)
  const [analytics, setAnalytics] = useState<{
    avgResponseHours: number | null
    subjectCounts: { subject: string; count: number }[]
  } | null>(null)

  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", String(limit))
    if (status !== "all") params.set("status", status)
    if (q.trim()) params.set("q", q.trim())
    if (from) params.set("from", new Date(from).toISOString())
    if (to) params.set("to", new Date(to + "T23:59:59.999Z").toISOString())

    try {
      const res = await fetch(`/api/admin/contact-messages?${params}`, { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Failed to load messages.")
        setRows([])
        return
      }
      const body = data as ContactListResponse
      setRows(body.data ?? [])
      setTotal(body.total ?? 0)
    } catch {
      setError("Network error.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, status, q, from, to, refetchN])

  useEffect(() => {
    void load()
  }, [load])

  function bumpRefetch() {
    setRefetchN((n) => n + 1)
  }

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/contact-messages/analytics", { cache: "no-store" })
        if (!res.ok) return
        const d = await res.json()
        setAnalytics({
          avgResponseHours: d.avgResponseHours ?? null,
          subjectCounts: Array.isArray(d.subjectCounts) ? d.subjectCounts : [],
        })
      } catch {
        /* ignore */
      }
    })()
  }, [])

  function exportCsv() {
    const params = new URLSearchParams()
    if (status !== "all") params.set("status", status)
    if (q.trim()) params.set("q", q.trim())
    if (from) params.set("from", new Date(from).toISOString())
    if (to) params.set("to", new Date(to + "T23:59:59.999Z").toISOString())
    window.location.href = `/api/admin/contact-messages/export?${params}`
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <AdminPageWrapper
      eyebrow="Inbox"
      title="Contact messages"
      description="Public contact form submissions, auto-tagged by topic. Reply and update status from the detail view."
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Contact messages" },
      ]}
      noPadding
    >
      {analytics ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Avg. first response
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {analytics.avgResponseHours != null
                ? `${analytics.avgResponseHours.toFixed(1)}h`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Top subjects (all time)
            </p>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {analytics.subjectCounts.slice(0, 6).map((s) => (
                <li
                  key={s.subject}
                  className="rounded-full bg-muted px-3 py-1 text-muted-foreground"
                >
                  {formatSubject(s.subject)}{" "}
                  <span className="font-semibold text-foreground">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="w-full min-w-[160px] sm:w-44">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select
              value={status}
              onValueChange={(v) => {
                setPage(1)
                setStatus(v as ContactMessageStatus | "all")
              }}
            >
              <SelectTrigger aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full min-w-[120px] sm:w-40">
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setPage(1)
                setFrom(e.target.value)
              }}
              aria-label="Date from"
            />
          </div>
          <div className="w-full min-w-[120px] sm:w-40">
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setPage(1)
                setTo(e.target.value)
              }}
              aria-label="Date to"
            />
          </div>
          <div className="w-full min-w-[200px] sm:w-56">
            <label className="text-xs text-muted-foreground">Search</label>
            <Input
              placeholder="Name or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1)
                  void load()
                }
              }}
              aria-label="Search by name or email"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => bumpRefetch()}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Refresh
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Export CSV
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setPage(1)
              bumpRefetch()
            }}
          >
            Apply filters
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No messages match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/contact-messages/${r.id}`}
                      className="text-primary hover:underline"
                    >
                      {r.name}
                      {r.isUrgent ? (
                        <span className="ml-2 rounded bg-destructive/15 px-1.5 py-0.5 text-xs text-destructive">
                          Urgent
                        </span>
                      ) : null}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.email}</TableCell>
                  <TableCell>{formatSubject(r.subject)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        r.status === "new" && "bg-li-magenta/20 text-li-magenta",
                        r.status === "in_progress" && "bg-li-sky/30 text-li-ocean",
                        r.status === "resolved" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </AdminPageWrapper>
  )
}
