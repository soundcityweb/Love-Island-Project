"use client"

import type { ScheduleView } from "./types"

const TABS: { id: ScheduleView; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "episode", label: "Episodes" },
]

export function ViewSwitcher({
  view,
  onViewChange,
}: {
  view: ScheduleView
  onViewChange: (v: ScheduleView) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        View
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide sm:flex-initial">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            aria-current={view === id ? "true" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
              view === id
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
