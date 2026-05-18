import type { QuickStat } from "@/app/types/admin-dashboard"

// ---------------------------------------------------------------------------
// Icon helpers (local — only used in this file)
// ---------------------------------------------------------------------------

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  )
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.306-4.306a11.95 11.95 0 0 1 5.814 5.518l2.74 1.22m0 0-5.94 2.281m5.94-2.28-2.28-5.941" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

interface StatCardProps {
  stat: QuickStat
}

export function StatCard({ stat }: StatCardProps) {
  const isUp = stat.trend === "up"
  const isDown = stat.trend === "down"

  const trendClass = isUp
    ? "text-emerald-600"
    : isDown
      ? "text-rose-600"
      : "text-muted-foreground"

  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      role="region"
      aria-label={stat.label}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${trendClass}`}>
          {isUp && <TrendUpIcon className="h-3 w-3" />}
          {isDown && <TrendDownIcon className="h-3 w-3" />}
          {stat.change}
        </span>
      </div>
      <p
        className="mt-2 text-2xl font-bold text-foreground"
        aria-live="polite"
        aria-atomic
      >
        {stat.value}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatCardSkeleton — shown while metrics are loading
// ---------------------------------------------------------------------------

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      aria-busy="true"
      aria-label="Loading stat"
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-muted" />
    </div>
  )
}
