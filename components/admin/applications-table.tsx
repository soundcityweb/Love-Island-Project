"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "./admin-stats"
import { ApplicationTableRow } from "./application-table-row"
import { updateApplicationStatus } from "@/app/lib/api-admin"
import type { Application } from "@/app/types/application"

interface ApplicationsTableProps {
  applications?: Application[]
  isLoading?: boolean
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-8 w-8 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <p className="text-sm font-medium">No applications found</p>
          <p className="text-xs text-muted-foreground/70">
            Try adjusting your filters or check back later
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ApplicationsTable({
  applications = [],
  isLoading = false,
}: ApplicationsTableProps) {
  const [localApplications, setLocalApplications] = useState<Application[]>(applications)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set())

  // Sync local state when applications prop changes (from server)
  useEffect(() => {
    setLocalApplications(applications)
  }, [applications])

  // Always use localApplications as the source of truth for rendering
  // This allows optimistic updates to persist until server data refreshes
  const apps = localApplications

  const stats = useMemo(() => {
    return {
      total: apps.length,
      submitted: apps.filter((a) => a.status === "submitted").length,
      underReview: apps.filter((a) => a.status === "under_review").length,
      accepted: apps.filter((a) => a.status === "accepted").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    }
  }, [apps])

  const filtered = useMemo(() => {
    let list = apps
    if (activeTab !== "all") {
      const statusMap: Record<string, Application["status"]> = {
        submitted: "submitted",
        "under-review": "under_review",
        accepted: "accepted",
        rejected: "rejected",
      }
      list = list.filter((a) => a.status === statusMap[activeTab])
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      )
    }
    return list
  }, [apps, activeTab, search])

  /**
   * Handle status update with optimistic UI updates
   * Updates UI immediately, rolls back on failure
   */
  const handleStatusChange = useCallback(
    async (id: string, newStatus: Application["status"]) => {
      // Find the application to save previous state for rollback
      const previousApplication = apps.find((a) => a.id === id)
      if (!previousApplication) {
        console.error(`Application ${id} not found`)
        return
      }

      const previousStatus = previousApplication.status

      // Optimistic update: update UI immediately
      setUpdatingStatus((prev) => new Set(prev).add(id))
      setLocalApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      )

      try {
        // Call API to update status
        await updateApplicationStatus(id, newStatus)
        // Success - UI already updated optimistically
      } catch (error) {
        console.error("Failed to update application status:", error)
        
        // Rollback: revert to previous status
        setLocalApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: previousStatus } : a))
        )

        // TODO: Show error toast/notification to user
        // Example: toast.error("Failed to update status. Please try again.")
      } finally {
        setUpdatingStatus((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [apps]
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <AdminStats
        total={stats.total}
        pending={stats.submitted + stats.underReview}
        approved={stats.accepted}
        rejected={stats.rejected}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">
                {stats.total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted
              <span className="ml-1.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                {stats.submitted}
              </span>
            </TabsTrigger>
            <TabsTrigger value="under-review">
              Under Review
              <span className="ml-1.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                {stats.underReview}
              </span>
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                {stats.accepted}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <span className="ml-1.5 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                {stats.rejected}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, city, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden lg:table-cell">Submitted</TableHead>
              <TableHead className="hidden sm:table-cell">Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((application) => (
                <ApplicationTableRow
                  key={application.id}
                  application={application}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer count */}
      {!isLoading && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} of {apps.length} application
          {apps.length !== 1 && "s"}
        </p>
      )}
    </div>
  )
}
