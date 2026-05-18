"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

import { StatCard, StatCardSkeleton } from "@/components/admin/dashboard/stat-card"
import { ModuleCard, ModuleCardSkeleton } from "@/components/admin/dashboard/module-card"
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"

import {
  CMS_MODULES,
  QUICK_ACTIONS,
} from "@/app/lib/admin-dashboard"

import type {
  ActivityItem,
  CMSModule,
  DashboardApiResponse,
  QuickStat,
} from "@/app/types/admin-dashboard"

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Merge live counts from the API into the static CMS module definitions. */
function buildLiveModules(
  base: CMSModule[],
  counts: DashboardApiResponse["moduleCounts"],
): CMSModule[] {
  const countMap: Record<string, string> = {
    "/admin/cms/landing": String(counts.landingSections),
    "/admin/cms/islanders": String(counts.islanders),
    "/admin/cms/news": String(counts.articles),
    "/admin/voting": String(counts.activeVotingPolls),
    "/admin/products": String(counts.products),
    "/admin/cms/videos": String(counts.videos),
  }
  return base.map((m) =>
    m.href in countMap
      ? { ...m, stats: { ...m.stats, value: countMap[m.href] } }
      : m,
  )
}

/** Build the four quick-stat cards from live API data. */
function buildLiveStats(data: DashboardApiResponse["stats"]): QuickStat[] {
  return [
    {
      label: "Applications",
      value: data.applications.toLocaleString(),
      change: "total",
      trend: "neutral" as const,
    },
    {
      label: "Votes Cast",
      value: data.totalVotesCast.toLocaleString(),
      change: "total",
      trend: "neutral" as const,
    },
    {
      label: "Published Articles",
      value: data.publishedArticles.toLocaleString(),
      change: "live",
      trend: "up" as const,
    },
    {
      label: "Pending Orders",
      value: data.pendingOrders.toLocaleString(),
      change: data.pendingOrders > 0 ? "needs action" : "all clear",
      trend: data.pendingOrders > 0 ? ("down" as const) : ("up" as const),
    },
  ]
}

// ── ErrorBanner ───────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <span>{message}</span>
      <button
        onClick={onRetry}
        className="ml-4 shrink-0 rounded-md bg-destructive/20 px-3 py-1 text-xs font-medium hover:bg-destructive/30"
      >
        Retry
      </button>
    </div>
  )
}

// ── AdminCMSDashboard ─────────────────────────────────────────────────────────

export default function AdminCMSDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveModules, setLiveModules] = useState<CMSModule[]>(CMS_MODULES)
  const [liveStats, setLiveStats] = useState<QuickStat[]>([])
  const [liveActivity, setLiveActivity] = useState<ActivityItem[]>([])

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        throw new Error(body.message ?? `Server returned ${res.status}`)
      }
      const data: DashboardApiResponse = await res.json()
      setLiveModules(buildLiveModules(CMS_MODULES, data.moduleCounts))
      setLiveStats(buildLiveStats(data.stats))
      setLiveActivity(data.recentActivity)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <div className="mx-auto max-w-7xl">
      <main>
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Content Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all content across the Love Island Nigeria website.
          </p>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchDashboard} />}

        {/* Quick Stats */}
        <section className="mb-8" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : liveStats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </div>
        </section>

        {/* CMS Module Grid */}
        <section className="mb-8" aria-labelledby="modules-heading">
          <h2
            id="modules-heading"
            className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground"
          >
            Content Sections
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
              : liveModules.map((module) => (
                  <ModuleCard key={module.href} module={module} />
                ))}
          </div>
        </section>

        {/* Activity feed + Quick actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed
            activities={liveActivity}
            isLoading={isLoading}
            skeletonCount={5}
          />
          <QuickActions actions={QUICK_ACTIONS} siteHref="/" />
        </div>
      </main>
    </div>
  )
}
