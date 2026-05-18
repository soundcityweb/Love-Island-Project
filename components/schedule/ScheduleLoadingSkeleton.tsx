"use client"

export function ScheduleLoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading schedule">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl bg-gradient-to-r from-muted/80 to-muted/40"
        />
      ))}
    </div>
  )
}
