"use client"

import { useState, useEffect, useCallback } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminResultsCharts } from "@/components/admin/admin-results-charts"
import type { AdminVotingAnalytics, VotingPeriodItem } from "@/app/lib/api-admin"

const REFRESH_INTERVAL_MS = 10_000

function formatEventEndDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

interface AdminResultsViewProps {
  periods: VotingPeriodItem[]
}

export function AdminResultsView({ periods }: AdminResultsViewProps) {
  const [eventId, setEventId] = useState<string | null>(
    periods.length > 0 ? periods[0].id : null,
  )
  const [analytics, setAnalytics] = useState<AdminVotingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/voting-events/${id}/analytics`, {
        cache: "no-store",
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
      } & Partial<AdminVotingAnalytics>
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to load analytics",
        )
      }
      setAnalytics(data as AdminVotingAnalytics)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics")
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!eventId) {
      setAnalytics(null)
      setLoading(false)
      return
    }
    fetchAnalytics(eventId)
    const interval = setInterval(() => fetchAnalytics(eventId), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [eventId, fetchAnalytics])

  const selectedPeriod = periods.find((p) => p.id === eventId)

  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)

  const downloadExport = useCallback(
    async (format: "csv" | "xlsx") => {
      if (!eventId) return
      setExporting(format)
      try {
        const res = await fetch(
          `/api/admin/voting-events/${eventId}/export?format=${format}`,
        )
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string }
          throw new Error(
            typeof data.message === "string" ? data.message : "Export failed",
          )
        }
        const blob = await res.blob()
        const cd = res.headers.get("Content-Disposition")
        const quoted = cd?.match(/filename="([^"]+)"/)
        const unquoted = cd?.match(/filename=([^;\s]+)/)
        const rawName = quoted?.[1] ?? unquoted?.[1]
        const fallback =
          format === "xlsx" ? "voting-results.xlsx" : "voting-results.csv"
        const filename = rawName?.trim() ? rawName.replace(/["']/g, "") : fallback
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.rel = "noopener"
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Export failed")
      } finally {
        setExporting(null)
      }
    },
    [eventId],
  )

  const contestants = analytics?.contestants ?? []
  const totalVotes = analytics?.totalVotes ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label htmlFor="event-select" className="text-sm font-medium text-foreground">
          Voting event
        </label>
        <select
          id="event-select"
          value={eventId ?? ""}
          onChange={(e) => setEventId(e.target.value || null)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {periods.length === 0 ? (
            <option value="">No events</option>
          ) : (
            periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status}) — {formatEventEndDate(p.endsAt)}
              </option>
            ))
          )}
        </select>
        <span className="text-xs text-muted-foreground">
          Auto-refreshes every 10 seconds
        </span>
        {eventId && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!!exporting || (loading && !analytics)}
              onClick={() => downloadExport("csv")}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {exporting === "csv" ? "Exporting…" : "Export CSV"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!!exporting || (loading && !analytics)}
              onClick={() => downloadExport("xlsx")}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Results are read-only. Analytics aggregate live vote data from the backend.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && !analytics ? (
        <div className="flex items-center justify-center py-12" role="status">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="sr-only">Loading analytics…</span>
        </div>
      ) : !eventId ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Select a voting event to view results.
        </p>
      ) : analytics ? (
        <>
          {selectedPeriod && (
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{selectedPeriod.name}</span>
              <span className="text-muted-foreground">Status: {selectedPeriod.status}</span>
              <span className="text-muted-foreground">
                Total votes: <strong>{totalVotes.toLocaleString()}</strong>
              </span>
            </div>
          )}

          <AdminResultsCharts analytics={analytics} />

          {contestants.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No votes recorded for this event yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-foreground">Contestant</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right">
                      Votes
                    </th>
                    <th className="hidden px-4 py-3 font-semibold text-foreground text-right sm:table-cell">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contestants.map((row) => (
                    <tr
                      key={row.islanderId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 text-foreground">{row.name}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                        {row.votes.toLocaleString()}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">
                        {row.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
