"use client"

import { formatRelativeTime } from "@/app/lib/format-time"
import type { ActivityItem, ActivityType } from "@/app/types/admin-dashboard"

// ── Activity-type icon map ────────────────────────────────────────────────────

function ArticleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function VideoCameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

const TYPE_CONFIG: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; bg: string; text: string }
> = {
  article: { icon: ArticleIcon, bg: "bg-emerald-500/10", text: "text-emerald-600" },
  islander: { icon: UserIcon, bg: "bg-violet-500/10", text: "text-violet-600" },
  product: { icon: ShoppingBagIcon, bg: "bg-cyan-500/10", text: "text-cyan-600" },
  order: { icon: ReceiptIcon, bg: "bg-amber-500/10", text: "text-amber-600" },
  video: { icon: VideoCameraIcon, bg: "bg-indigo-500/10", text: "text-indigo-600" },
}

const FALLBACK_CONFIG = {
  icon: ArticleIcon,
  bg: "bg-muted",
  text: "text-muted-foreground",
}

// ── Loading skeleton for a single activity row ────────────────────────────────

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-5 py-4" aria-hidden>
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-3 w-14 animate-pulse rounded bg-muted" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      <ArticleIcon className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
      <p className="text-xs text-muted-foreground/70">
        Changes to content, islanders, and orders will appear here.
      </p>
    </div>
  )
}

// ── ActivityFeed ──────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
  skeletonCount?: number
  onViewAll?: () => void
}

export function ActivityFeed({
  activities,
  isLoading = false,
  skeletonCount = 5,
  onViewAll,
}: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Recent Activity
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div
          aria-busy="true"
          aria-label="Loading recent activity"
          className="divide-y divide-border"
        >
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyActivity />
      ) : (
        <ul className="divide-y divide-border" aria-label="Recent activity">
          {activities.map((activity, i) => {
            const config =
              activity.type ? (TYPE_CONFIG[activity.type] ?? FALLBACK_CONFIG) : FALLBACK_CONFIG
            const Icon = config.icon
            const relativeTime = formatRelativeTime(activity.time)

            return (
              <li key={i} className="flex items-start gap-3 px-5 py-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                >
                  <Icon className={`h-4 w-4 ${config.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="truncate text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <time
                  className="shrink-0 whitespace-nowrap text-xs text-muted-foreground"
                  dateTime={activity.time}
                  title={new Date(activity.time).toLocaleString()}
                >
                  {relativeTime}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
