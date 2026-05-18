import type { ComponentType } from "react"

/** Direction of a metric change indicator. */
export type TrendDirection = "up" | "down" | "neutral"

/**
 * A CMS module entry — one card in the Content Sections grid.
 * The `icon` field accepts any icon component that takes an optional `className`.
 */
export interface CMSModule {
  /** Display title shown on the card */
  title: string
  /** Short description of what this module manages */
  description: string
  /** Icon component rendered in the coloured badge */
  icon: ComponentType<{ className?: string }>
  /** Navigation target when the card is clicked */
  href: string
  /** Summary stat shown in the top-right of the card */
  stats: {
    label: string
    /** Display value — replace with a live API field once data fetching is wired */
    value: string
  }
  /** Tailwind bg + text colour classes for the icon container, e.g. "bg-blue-500/10 text-blue-600" */
  color: string
}

/** A single metric shown in the quick-stats strip. */
export interface QuickStat {
  label: string
  /** Display value, e.g. "1.2M" — replace with live data when API is ready */
  value: string
  /** Human-readable change label, e.g. "+12.5%" */
  change: string
  trend: TrendDirection
}

/** Content type that produced a recent-activity entry. */
export type ActivityType =
  | "article"
  | "islander"
  | "product"
  | "order"
  | "video"

/** One item in the recent-activity feed. */
export interface ActivityItem {
  /** Short verb phrase, e.g. "Article published" */
  action: string
  /** The specific content item that was affected */
  item: string
  /** ISO-8601 timestamp from the API, used as both the <time> dateTime and for formatting */
  time: string
  /** Optional discriminator for icon/colour selection */
  type?: ActivityType
}

/**
 * A quick-action button.
 * Rendered as a Link so the navigation handler is always a URL — no dead
 * onClick stubs needed.
 */
export interface QuickAction {
  label: string
  /** Secondary line shown beneath the label */
  description: string
  /** Icon rendered alongside the label */
  icon: ComponentType<{ className?: string }>
  /** URL navigated to when the button is pressed */
  href: string
}

/** A single link in the admin top navigation bar. */
export interface AdminNavItem {
  label: string
  href: string
}

// ── API response types ──────────────────────────────────────────────────────

export interface DashboardModuleCounts {
  landingSections: number
  islanders: number
  articles: number
  videos: number
  products: number
  orders: number
  activeVotingPolls: number
}

export interface DashboardStats {
  applications: number
  totalVotesCast: number
  publishedArticles: number
  pendingOrders: number
}

export interface DashboardApiResponse {
  moduleCounts: DashboardModuleCounts
  stats: DashboardStats
  recentActivity: ActivityItem[]
}
