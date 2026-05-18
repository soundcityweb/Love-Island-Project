"use client"

import type { SchedulePlatform } from "./types"
import { PLATFORM_FILTERS } from "./schedule-utils"

export function PlatformFilter({
  platform,
  onPlatformChange,
}: {
  platform: SchedulePlatform | null
  onPlatformChange: (p: SchedulePlatform | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
      <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Platform
      </span>
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {PLATFORM_FILTERS.map(({ id, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPlatformChange(id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
              platform === id
                ? "btn-gradient text-white shadow-warm"
                : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
