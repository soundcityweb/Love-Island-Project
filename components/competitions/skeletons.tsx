// Skeleton components for the Competitions module.
// All are server-compatible — no "use client" directive needed.

import { CompetitionCardSkeleton } from "./competition-card"

// ── List page ─────────────────────────────────────────────────────────────────

/**
 * Full skeleton for the /competitions listing page.
 * Mirrors the real page's hero → tabs → grid layout.
 */
export function CompetitionsListSkeleton() {
  return (
    <div className="min-w-0 overflow-x-hidden bg-foreground">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-20 sm:pt-28 md:px-8 lg:px-12 lg:pb-28 lg:pt-36">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A17]/40 via-[#FF36A0]/30 to-[#160810]" />
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Eyebrow pill */}
          <div className="mb-5 mx-auto h-7 w-36 animate-pulse rounded-full bg-white/10" />
          {/* Heading */}
          <div className="mx-auto h-14 max-w-md animate-pulse rounded-2xl bg-white/10 sm:h-16" />
          {/* Subheading */}
          <div className="mx-auto mt-5 h-5 max-w-sm animate-pulse rounded-full bg-white/8" />
          <div className="mx-auto mt-2 h-5 max-w-xs animate-pulse rounded-full bg-white/6" />
          {/* Stats row */}
          <div className="mx-auto mt-8 flex max-w-xs justify-center gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-6 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-white/7" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground to-transparent" />
      </div>

      {/* Tabs skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8 lg:px-12">
        <div className="flex gap-3">
          {[80, 72, 90].map((w, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-full bg-white/8"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Cards grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompetitionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Detail page ───────────────────────────────────────────────────────────────

/**
 * Full skeleton for a /competitions/[slug] detail page.
 * Mirrors hero → 2-column content layout.
 */
export function CompetitionDetailSkeleton() {
  return (
    <div className="min-w-0 overflow-x-hidden bg-foreground">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden pb-14 pt-24 sm:pb-16 sm:pt-28 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A17]/50 via-[#FF4D80]/40 to-[#160810]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8 lg:px-12">
          {/* Sponsor badge */}
          <div className="mb-5 mx-auto h-7 w-44 animate-pulse rounded-full bg-white/10" />
          {/* Status pill */}
          <div className="mb-4 mx-auto h-6 w-16 animate-pulse rounded-full bg-white/10" />
          {/* Title */}
          <div className="mx-auto h-12 max-w-sm animate-pulse rounded-2xl bg-white/10 sm:h-14" />
          {/* Description */}
          <div className="mx-auto mt-4 h-4 max-w-lg animate-pulse rounded-full bg-white/7" />
          <div className="mx-auto mt-2 h-4 max-w-md animate-pulse rounded-full bg-white/5" />
          {/* Countdown blocks */}
          <div className="mx-auto mt-8 flex max-w-xs justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-14 w-[60px] animate-pulse rounded-xl bg-white/10" />
                <div className="h-2.5 w-8 animate-pulse rounded-full bg-white/8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-4">
            {/* Progress bar area */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-32 animate-pulse rounded-full bg-white/8" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-white/6" />
              </div>
              <div className="h-1.5 animate-pulse rounded-full bg-white/8" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-1 flex-1 animate-pulse rounded-full bg-white/8" />
                ))}
              </div>
            </div>

            {/* Question card */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-5 space-y-2">
                <div className="h-5 animate-pulse rounded-full bg-white/8" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/6" />
              </div>
              {/* Options */}
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            </div>

            {/* Nav buttons */}
            <div className="hidden justify-between md:flex">
              <div className="h-10 w-28 animate-pulse rounded-xl bg-white/5" />
              <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="h-5 w-32 animate-pulse rounded-full bg-white/8" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-white/8" />
                  <div className="h-3 flex-1 animate-pulse rounded-full bg-white/5" />
                </div>
              ))}
            </div>
            <div className="h-28 animate-pulse rounded-2xl bg-amber-500/5 border border-amber-500/10" />
          </div>
        </div>
      </div>
    </div>
  )
}
