/**
 * Admin dashboard data and icon definitions.
 *
 * This file is intentionally `.tsx` because the CMSModule and QuickAction
 * entries embed React icon components. Replace static `stats.value` and
 * `QuickStat.value` fields with live API data when fetching is wired up.
 */

import type {
  ActivityItem,
  AdminNavItem,
  CMSModule,
  QuickAction,
  QuickStat,
} from "@/app/types/admin-dashboard"

// ---------------------------------------------------------------------------
// Icon components (used only within this module's data definitions)
// ---------------------------------------------------------------------------

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  )
}

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function CalendarDaysIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
    </svg>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 3-3h3.75a3 3 0 0 1 3 3v8.25a3 3 0 0 1-3 3h-3.75Z"
      />
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

// ---------------------------------------------------------------------------
// Admin nav
// ---------------------------------------------------------------------------

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Voting", href: "/admin/voting" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "View Site", href: "/" },
]

// ---------------------------------------------------------------------------
// Quick stats
// Replace `value` and `change` with live fields from your analytics API.
// ---------------------------------------------------------------------------

export const QUICK_STATS: QuickStat[] = [
  { label: "Total Page Views", value: "1.2M", change: "+12.5%", trend: "up" },
  { label: "Active Visitors", value: "3,847", change: "+8.2%", trend: "up" },
  { label: "Applications", value: "10,234", change: "+24.1%", trend: "up" },
  { label: "Votes Cast", value: "847K", change: "+15.7%", trend: "up" },
]

// ---------------------------------------------------------------------------
// CMS modules
// Replace `stats.value` with a live count from each section's API endpoint.
// ---------------------------------------------------------------------------

export const CMS_MODULES: CMSModule[] = [
  {
    title: "Landing Page",
    description: "Manage hero, countdown, and featured content sections",
    icon: HomeIcon,
    href: "/admin/cms/landing",
    stats: { label: "Sections", value: "6" },
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Islanders",
    description: "Edit contestant profiles, bios, and media galleries",
    icon: UsersIcon,
    href: "/admin/cms/islanders",
    stats: { label: "Profiles", value: "12" },
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "News & Articles",
    description: "Publish news stories, recaps, and editorial content",
    icon: NewspaperIcon,
    href: "/admin/cms/news",
    stats: { label: "Articles", value: "24" },
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "TV Schedule",
    description: "Manage air times, platforms, and featured slots",
    icon: CalendarDaysIcon,
    href: "/admin/cms/schedule",
    stats: { label: "Slots", value: "—" },
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Podcasts",
    description: "Add episodes, audio URLs, thumbnails, and show notes",
    icon: MicIcon,
    href: "/admin/podcasts",
    stats: { label: "Episodes", value: "—" },
    color: "bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    title: "Voting",
    description: "Configure polls, manage vote periods, and view results",
    icon: ChartBarIcon,
    href: "/admin/voting",
    stats: { label: "Active Polls", value: "2" },
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Store",
    description: "Manage products, inventory, pricing, and orders",
    icon: ShoppingBagIcon,
    href: "/admin/products",
    stats: { label: "Products", value: "18" },
    color: "bg-cyan-500/10 text-cyan-600",
  },
]

// ---------------------------------------------------------------------------
// Recent activity
// Replace with a fetch from your activity/audit-log API endpoint.
// ---------------------------------------------------------------------------

export const RECENT_ACTIVITY: ActivityItem[] = [
  { action: "Article published", item: "Week 3 Recap: Drama at the Villa", time: "2 hours ago" },
  { action: "Islander updated", item: "Amara Okonkwo — New photos added", time: "4 hours ago" },
  { action: "Product added", item: "Limited Edition Hoodie", time: "6 hours ago" },
  { action: "Poll created", item: "Save Your Favourite Islander", time: "1 day ago" },
]

// ---------------------------------------------------------------------------
// Quick actions
// Each action navigates to its `href` — no dead onClick stubs needed.
// ---------------------------------------------------------------------------

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "New Article",
    description: "Publish news",
    icon: NewspaperIcon,
    href: "/admin/cms/news?new=1",
  },
  {
    label: "New Schedule",
    description: "Add air time",
    icon: CalendarDaysIcon,
    href: "/admin/cms/schedule?new=1",
  },
  {
    label: "Create Poll",
    description: "New voting",
    icon: ChartBarIcon,
    href: "/admin/voting",
  },
  {
    label: "Add Product",
    description: "New merch",
    icon: ShoppingBagIcon,
    href: "/admin/products?new=1",
  },
]
