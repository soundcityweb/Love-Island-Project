"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Vote,
  Trophy,
  Newspaper,
  Mic2,
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  BarChart2,
  Package,
  ShoppingCart,
  Tag,
  Ticket,
  CalendarDays,
  LayoutTemplate,
  PieChart,
  HelpCircle,
  Target,
  Upload,
  List,
  UserCircle2,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SiteLogo, SiteLogoIconMark } from "@/components/layout/SiteLogo"

// ── Public types ──────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  /** Force exact-path matching (prevents prefix matches from sibling sub-pages) */
  exact?: boolean
  children?: SidebarNavItem[]
}

export interface AdminSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
  navItems?: SidebarNavItem[]
}

export const DEFAULT_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard",    href: "/admin",              icon: LayoutDashboard },
  { label: "Applications", href: "/admin/applications", icon: ClipboardList   },
  { label: "Contact",      href: "/admin/contact-messages", icon: Mail },

  {
    label: "Content",
    href:  "/admin/cms",
    icon:  FileText,
    children: [
      { label: "Islander Profiles", href: "/admin/cms/islanders", icon: Users          },
      { label: "News & Articles",   href: "/admin/cms/news",      icon: Newspaper      },
      { label: "Static pages",      href: "/admin/cms/pages",     icon: FileText       },
      { label: "Videos",            href: "/admin/cms/videos",    icon: Eye            },
      { label: "TV Schedule",       href: "/admin/cms/schedule",  icon: CalendarDays   },
      { label: "Landing Page",      href: "/admin/cms/landing",   icon: LayoutTemplate },
    ],
  },

  {
    label: "Voting",
    href:  "/admin/voting",
    icon:  Vote,
    children: [
      { label: "Manage",  href: "/admin/voting",  icon: List      },
      { label: "Results", href: "/admin/results", icon: BarChart2 },
    ],
  },

  {
    label: "Competitions",
    href:  "/admin/competitions",
    icon:  Trophy,
    children: [
      { label: "All Competitions", href: "/admin/competitions", exact: true,            icon: Trophy     },
      { label: "Poll Results",     href: "/admin/competitions/poll-results",           icon: PieChart   },
      { label: "Quiz",             href: "/admin/competitions/quiz-submissions",       icon: HelpCircle },
      { label: "Predictions",      href: "/admin/competitions/prediction-submissions", icon: Target     },
      { label: "Gallery",          href: "/admin/competitions/upload-gallery",         icon: Upload     },
    ],
  },

  { label: "Podcast", href: "/admin/podcasts", icon: Mic2 },

  {
    label: "Merch Store",
    href:  "/admin/products",
    icon:  ShoppingBag,
    children: [
      { label: "Products",   href: "/admin/products",   icon: Package      },
      { label: "Orders",     href: "/admin/orders",     icon: ShoppingCart },
      { label: "Categories", href: "/admin/categories", icon: Tag          },
      { label: "Coupons",    href: "/admin/coupons",    icon: Ticket       },
      { label: "Analytics",  href: "/admin/analytics",  icon: BarChart2    },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesHref(href: string, pathname: string, exact?: boolean) {
  if (exact || href === "/admin") return pathname === href
  // startsWith with a "/" separator prevents "/admin/competitions" matching
  // "/admin/competitions/quiz-submissions" when the trailing segment differs
  return pathname === href || pathname.startsWith(href + "/")
}

function isAnyChildActive(item: SidebarNavItem, pathname: string): boolean {
  return Boolean(item.children?.some((c) => matchesHref(c.href, pathname, c.exact)))
}

// ── Sub-item (inside expanded group or flyout) ────────────────────────────────

function SubItem({
  item,
  pathname,
  onClick,
}: {
  item: SidebarNavItem
  pathname: string
  onClick?: () => void
}) {
  const active = matchesHref(item.href, pathname, item.exact)
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
          active
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <item.icon
          className={cn(
            "h-[15px] w-[15px] shrink-0",
            active
              ? "text-primary"
              : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
          )}
          aria-hidden
        />
        <span className="flex-1 truncate">{item.label}</span>
        {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
      </Link>
    </li>
  )
}

// ── Collapsed flyout panel ────────────────────────────────────────────────────

function CollapsedFlyout({
  item,
  y,
  pathname,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  item: SidebarNavItem
  y: number
  pathname: string
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  // Clamp so flyout doesn't go off the bottom of the viewport
  const maxTop = typeof window !== "undefined" ? window.innerHeight - 320 : y
  const top = Math.min(y, maxTop)

  return (
    <div
      className="fixed z-50"
      style={{ top, left: 80 }} // 72px sidebar + 8px gap
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Arrow bridge — transparent strip that bridges the 8px gap so
          the mouse doesn't "fall off" when moving from icon to panel */}
      <div className="absolute -left-2 top-0 h-full w-2" />

      <div className="w-52 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-sidebar-border px-3 py-2.5">
          <item.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="text-sm font-semibold text-sidebar-foreground">{item.label}</span>
        </div>
        {/* Children */}
        <ul className="p-1.5 space-y-0.5">
          {item.children!.map((child) => (
            <SubItem
              key={child.href}
              item={child}
              pathname={pathname}
              onClick={onClose}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  isCollapsed,
  pathname,
  onMobileClose,
  onFlyoutOpen,
  onFlyoutClose,
}: {
  item: SidebarNavItem
  isCollapsed: boolean
  pathname: string
  onMobileClose: () => void
  onFlyoutOpen: (item: SidebarNavItem, y: number) => void
  onFlyoutClose: () => void
}) {
  const hasChildren = Boolean(item.children?.length)
  const childActive = isAnyChildActive(item, pathname)
  const selfActive = matchesHref(item.href, pathname, item.exact)
  const active = hasChildren ? childActive : selfActive

  const [open, setOpen] = useState(() => childActive)
  useEffect(() => { if (childActive) setOpen(true) }, [childActive])

  // ── Collapsed mode ────────────────────────────────────────
  if (isCollapsed) {
    return (
      <li
        className="w-full px-2"
        onMouseEnter={(e) => {
          if (hasChildren) {
            const rect = e.currentTarget.getBoundingClientRect()
            onFlyoutOpen(item, rect.top)
          }
        }}
        onMouseLeave={() => { if (hasChildren) onFlyoutClose() }}
      >
        <Link
          href={item.href}
          onClick={onMobileClose}
          title={item.label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150",
            active
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <item.icon
            className={cn(
              "h-[19px] w-[19px] shrink-0",
              active ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
        </Link>
      </li>
    )
  }

  // ── Expanded: group with collapsible children ─────────────
  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
            active
              ? "bg-primary/15 text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <span
            className={cn(
              "absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
              active ? "h-5 opacity-100" : "h-0 opacity-0",
            )}
            aria-hidden
          />
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              active
                ? "text-primary"
                : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
            )}
            aria-hidden
          />
          <span className="flex-1 truncate text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <ul
          className={cn(
            "ml-4 mt-0.5 space-y-0.5 overflow-hidden border-l border-sidebar-border pl-3 transition-all duration-200",
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {item.children!.map((child) => (
            <SubItem
              key={child.href}
              item={child}
              pathname={pathname}
              onClick={onMobileClose}
            />
          ))}
        </ul>
      </li>
    )
  }

  // ── Expanded: plain link ──────────────────────────────────
  return (
    <li>
      <Link
        href={item.href}
        onClick={onMobileClose}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
          active
            ? "bg-primary/15 text-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
            active ? "h-5 opacity-100" : "h-0 opacity-0",
          )}
          aria-hidden
        />
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            active
              ? "text-primary"
              : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
          )}
          aria-hidden
        />
        <span className="flex flex-1 items-center gap-2 overflow-hidden">
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge != null && item.badge > 0 ? (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold tabular-nums text-primary-foreground">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          ) : active ? (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          ) : null}
        </span>
      </Link>
    </li>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function AdminSidebar({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
  navItems = DEFAULT_ADMIN_NAV_ITEMS,
}: AdminSidebarProps) {
  const pathname = usePathname()

  // ── Flyout state (collapsed mode) ─────────────────────────
  const [flyout, setFlyout] = useState<{ item: SidebarNavItem; y: number } | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openFlyout = useCallback((item: SidebarNavItem, y: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setFlyout({ item, y })
  }, [])

  const scheduleFlyoutClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setFlyout(null), 120)
  }, [])

  const cancelFlyoutClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  // Close flyout when sidebar expands
  useEffect(() => {
    if (!isCollapsed) setFlyout(null)
  }, [isCollapsed])

  // Close flyout on route change
  useEffect(() => {
    setFlyout(null)
  }, [pathname])

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar",
          "transition-[width,transform] duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* ── Brand header ─────────────────────────────── */}
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-3">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center transition-all duration-300",
              isCollapsed ? "mx-auto justify-center" : "gap-1",
            )}
          >
            {isCollapsed ? (
              <SiteLogoIconMark href="/admin" aria-label="Love Island Nigeria — Admin" />
            ) : (
              <SiteLogo
                href="/admin"
                variant="on-light"
                compact
                wordmarkClassName="text-sidebar-foreground"
                className="min-w-0 max-w-[calc(100%-2.5rem)]"
              />
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onMobileClose}
              aria-label="Close sidebar"
              className="ml-auto flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3"
          aria-label="Admin navigation"
        >
          <ul
            className={cn(
              "space-y-0.5",
              isCollapsed ? "px-0" : "px-2",
              isCollapsed && "flex flex-col items-center",
            )}
            role="list"
          >
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isCollapsed={isCollapsed}
                pathname={pathname}
                onMobileClose={onMobileClose}
                onFlyoutOpen={openFlyout}
                onFlyoutClose={scheduleFlyoutClose}
              />
            ))}
          </ul>
        </nav>

        {/* ── Collapse toggle (desktop only) ───────────── */}
        <div className={cn("shrink-0 border-t border-sidebar-border", isCollapsed ? "p-0 py-2" : "p-2")}>
          <button
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex",
              isCollapsed
                ? "mx-auto h-10 w-10 items-center justify-center rounded-xl text-muted-foreground"
                : "w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground",
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" aria-hidden />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* ── Collapsed flyout panel (rendered outside overflow nav) ── */}
        {isCollapsed && flyout && (
          <CollapsedFlyout
            item={flyout.item}
            y={flyout.y}
            pathname={pathname}
            onClose={() => setFlyout(null)}
            onMouseEnter={cancelFlyoutClose}
            onMouseLeave={scheduleFlyoutClose}
          />
        )}
      </aside>
    </>
  )
}
