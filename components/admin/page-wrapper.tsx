import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Sub-types ─────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  /** When provided the item is rendered as a link */
  href?: string
}

export interface AdminPageAction {
  /** The button / element to render */
  node: ReactNode
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AdminPageWrapperProps {
  // ── Header ──────────────────────────────────────────────────────────────────
  /** Primary page heading */
  title: string
  /**
   * Small eyebrow label rendered above the title as a pill.
   * Good for section names, season numbers, status tags, etc.
   */
  eyebrow?: string
  /** Supporting paragraph below the title */
  description?: string

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  /**
   * Breadcrumb items. The last item is always shown as plain text (current page).
   * e.g. `[{ label: "Admin", href: "/admin" }, { label: "Orders" }]`
   */
  breadcrumb?: BreadcrumbItem[]

  // ── Actions ─────────────────────────────────────────────────────────────────
  /**
   * Slot for header-level action buttons (e.g. "Create New", "Export").
   * Rendered right-aligned beside the title on desktop; stacks below on mobile.
   */
  actions?: ReactNode

  // ── Optional content zones ───────────────────────────────────────────────────
  /**
   * Stats row — rendered between the header and filters.
   * Ideal for analytics dashboards: pass a row of <StatCard /> components.
   */
  stats?: ReactNode
  /**
   * Filter bar — rendered between stats and the main content.
   * Pass search inputs, status selects, date pickers, etc.
   */
  filters?: ReactNode

  // ── Main content ─────────────────────────────────────────────────────────────
  children: ReactNode

  // ── Layout control ────────────────────────────────────────────────────────────
  /**
   * Remove the default padding and background from the content card.
   * Useful when `children` is already a full-bleed component (e.g. a table
   * with its own card border).
   */
  noPadding?: boolean
  /** Extra classes on the outermost wrapper */
  className?: string
  /** Extra classes on the content area */
  contentClassName?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminPageWrapper({
  title,
  eyebrow,
  description,
  breadcrumb,
  actions,
  stats,
  filters,
  children,
  noPadding = false,
  className,
  contentClassName,
}: AdminPageWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>

      {/* ── Breadcrumb ──────────────────────────────── */}
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} />
      )}

      {/* ── Page header ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: eyebrow + title + description */}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Right: action buttons */}
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* ── Stats row ───────────────────────────────── */}
      {stats && (
        <section aria-label="Page statistics">
          {stats}
        </section>
      )}

      {/* ── Filter bar ──────────────────────────────── */}
      {filters && (
        <section
          aria-label="Filters"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
        >
          {filters}
        </section>
      )}

      {/* ── Main content ────────────────────────────── */}
      <section
        aria-label={title}
        className={cn(
          !noPadding && "",
          contentClassName,
        )}
      >
        {children}
      </section>

    </div>
  )
}

// ── Breadcrumb sub-component ──────────────────────────────────────────────────

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {/* Separator (skip for first item) */}
              {index > 0 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden />
              )}

              {/* Item — link or plain text */}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "font-medium text-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
