import Link from "next/link"
import type { QuickAction } from "@/app/types/admin-dashboard"

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// QuickActionButton — renders as a <Link> so every action has a real href
// ---------------------------------------------------------------------------

function QuickActionButton({ action }: { action: QuickAction }) {
  const Icon = action.icon
  return (
    <Link
      href={action.href}
      className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted"
      aria-label={action.label}
    >
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{action.label}</p>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// QuickActions panel
// ---------------------------------------------------------------------------

interface QuickActionsProps {
  actions: QuickAction[]
  /** Link shown in the site-status footer bar */
  siteHref?: string
}

export function QuickActions({ actions, siteHref = "/" }: QuickActionsProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
      </div>

      {/* Action grid */}
      {actions.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No quick actions configured.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-5">
          {actions.map((action) => (
            <QuickActionButton key={action.href} action={action} />
          ))}
        </div>
      )}

      {/* Site status bar */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Animated pulse dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-foreground">Site Status: Live</span>
          </div>
          <Link
            href={siteHref}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Preview Site
          </Link>
        </div>
      </div>
    </div>
  )
}
