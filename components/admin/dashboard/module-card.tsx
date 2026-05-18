import Link from "next/link"
import type { CMSModule } from "@/app/types/admin-dashboard"

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ModuleCard
// ---------------------------------------------------------------------------

interface ModuleCardProps {
  module: CMSModule
}

export function ModuleCard({ module }: ModuleCardProps) {
  const Icon = module.icon

  return (
    <Link
      href={module.href}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
      aria-label={`Manage ${module.title}`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${module.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{module.stats.label}</p>
          <p className="text-lg font-bold text-foreground">{module.stats.value}</p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
          {module.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
      </div>

      <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Manage content
        <ChevronRightIcon className="ml-1 h-3 w-3" />
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// ModuleCardSkeleton — shown while modules are loading
// ---------------------------------------------------------------------------

export function ModuleCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-xl border border-border bg-card p-5"
      aria-busy="true"
      aria-label="Loading module"
    >
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-1.5 text-right">
          <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-5 w-6 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
