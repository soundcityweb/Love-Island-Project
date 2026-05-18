"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LogOut, UserCircle2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminSidebar, type SidebarNavItem } from "./sidebar"
import { AdminNavbar, type NavbarUser, type NavbarNotifications, type NavbarDropdownItem } from "./navbar"
import { useAuth } from "@/hooks/use-auth"

// ── Built-in route → title map ────────────────────────────────────────────────

const BUILT_IN_TITLES: Record<string, string> = {
  "/admin":                                        "Dashboard",
  "/admin/applications":                           "Applications",
  "/admin/contact-messages":                       "Contact Messages",
  // Content CMS
  "/admin/cms":                                    "Content",
  "/admin/cms/islanders":                          "Islander Profiles",
  "/admin/cms/news":                               "News & Articles",
  "/admin/cms/videos":                             "Videos",
  "/admin/cms/schedule":                           "TV Schedule",
  "/admin/cms/landing":                            "Landing Page",
  // Voting
  "/admin/voting":                                 "Voting",
  "/admin/results":                                "Results",
  // Competitions
  "/admin/competitions":                           "Competitions",
  "/admin/competitions/poll-results":              "Poll Results",
  "/admin/competitions/quiz-submissions":          "Quiz Submissions",
  "/admin/competitions/prediction-submissions":    "Prediction Submissions",
  "/admin/competitions/upload-gallery":            "Upload Gallery",
  // Podcast
  "/admin/podcasts":                               "Podcast",
  // Merch Store
  "/admin/products":                               "Products",
  "/admin/orders":                                 "Orders",
  "/admin/categories":                             "Categories",
  "/admin/coupons":                                "Coupons",
  "/admin/analytics":                              "Analytics",
  "/admin/profile":                                "Profile",
  // Settings redirects to profile (security tab)
  "/admin/settings":                               "Settings",
}

function resolveTitle(
  pathname: string,
  extra: Record<string, string> = {},
): string {
  const map = { ...BUILT_IN_TITLES, ...extra }
  if (map[pathname]) return map[pathname]
  // Longest-prefix match so /admin/orders/123 → "Orders"
  const match = Object.entries(map)
    .filter(([key]) => key !== "/admin" && pathname.startsWith(key))
    .sort((a, b) => b[0].length - a[0].length)[0]
  return match ? match[1] : "Admin"
}

// ── Content width presets ─────────────────────────────────────────────────────

const MAX_WIDTH_CLASS = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-5xl",
  xl:   "max-w-6xl",
  "2xl":"max-w-7xl",
  full: "max-w-full",
} as const

type ContentWidth = keyof typeof MAX_WIDTH_CLASS

// ── Public API ────────────────────────────────────────────────────────────────

export interface AdminLayoutProps {
  children: React.ReactNode

  // ── Title ──────────────────────────────────────────────────────────────────
  /**
   * Explicit page title shown in the navbar.
   * When omitted the title is auto-resolved from the current pathname.
   */
  title?: string
  /** Secondary line below the title (e.g. "12 pending items") */
  subtitle?: string
  /**
   * Extend (or override) the built-in route → title map.
   * Only used when `title` is not provided.
   * e.g. `{ "/admin/orders/new": "New Order" }`
   */
  pageTitleMap?: Record<string, string>

  // ── Layout ─────────────────────────────────────────────────────────────────
  /**
   * Maximum width applied to the inner content wrapper.
   * Defaults to `"2xl"` (max-w-7xl). Pass `"full"` for edge-to-edge pages.
   */
  maxWidth?: ContentWidth
  /**
   * Remove the default responsive padding from the content area.
   * Useful for full-bleed tables, maps, or custom-padded sections.
   */
  noPadding?: boolean
  /** Extra Tailwind classes forwarded to the `<main>` element */
  mainClassName?: string
  /** Extra Tailwind classes forwarded to the inner content `<div>` */
  contentClassName?: string

  // ── Sidebar pass-through ───────────────────────────────────────────────────
  /** Override the sidebar nav items */
  navItems?: SidebarNavItem[]

  // ── Navbar pass-through ────────────────────────────────────────────────────
  /** Logged-in user shown in the navbar avatar */
  user?: NavbarUser
  /** Notification bell state */
  notifications?: NavbarNotifications
  /** Profile dropdown items */
  dropdownItems?: NavbarDropdownItem[]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminLayout({
  children,
  // title
  title: titleProp,
  subtitle,
  pageTitleMap,
  // layout
  maxWidth = "2xl",
  noPadding = false,
  mainClassName,
  contentClassName,
  // sidebar
  navItems,
  // navbar
  user: userProp,
  notifications,
  dropdownItems: dropdownItemsProp,
}: AdminLayoutProps) {
  const pathname = usePathname()

  const [isCollapsed, setIsCollapsed]   = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Auth — redirects to /admin/login automatically if unauthenticated
  const { user: authUser, loading, logout } = useAuth({ redirectIfUnauthenticated: true })

  // Force dark class on <html> so Radix UI portals (Dialog, Tooltip, etc.)
  // also inherit the dark theme — they render outside our <div className="dark">.
  useEffect(() => {
    document.documentElement.classList.add("dark")
    return () => { document.documentElement.classList.remove("dark") }
  }, [])

  // Close the mobile drawer on every route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const title         = titleProp ?? resolveTitle(pathname, pageTitleMap)
  const contentOffset = isCollapsed ? "lg:ml-[72px]"   : "lg:ml-[260px]"
  const navbarOffset  = isCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"

  // Merge auth user into navbar user prop (explicit prop takes precedence)
  const navbarUser: NavbarUser | undefined = userProp ?? (authUser
    ? {
        name: authUser.name,
        email: authUser.email,
        initials: authUser.name.charAt(0).toUpperCase(),
      }
    : undefined)

  // Default dropdown items wired to logout
  const dropdownItems: NavbarDropdownItem[] = dropdownItemsProp ?? [
    {
      icon: UserCircle2,
      label: "My Profile & Security",
      href: "/admin/profile",
    },
    {
      icon: LogOut,
      label: "Sign Out",
      onClick: logout,
      separator: true,
      variant: "danger",
    },
  ]

  // Show a full-screen spinner while checking auth to prevent flicker
  if (loading) {
    return (
      <div className="dark">
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-700 border-t-pink-500" />
            <p className="text-sm text-zinc-500">Verifying session…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    // Scope the dark theme to the admin shell only
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">

        {/* ── Fixed sidebar ──────────────────────────── */}
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((c) => !c)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
          navItems={navItems}
        />

        {/* ── Main column (beside sidebar) ───────────── */}
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[margin] duration-300",
            contentOffset,
          )}
        >
          {/* ── Sticky navbar ────────────────────────── */}
          <AdminNavbar
            title={title}
            subtitle={subtitle}
            onMenuToggle={() => setIsMobileOpen(true)}
            sidebarOffset={navbarOffset}
            user={navbarUser}
            notifications={notifications}
            dropdownItems={dropdownItems}
          />

          {/* ── Scrollable page area ─────────────────── */}
          {/*
           * pt-16  → clears the fixed 64px navbar
           * flex-1 → fills remaining vertical space so short pages
           *          don't leave a gap at the bottom
           */}
          <main
            className={cn(
              "flex-1 pt-16",
              mainClassName,
            )}
          >
            <div
              className={cn(
                "mx-auto w-full",
                MAX_WIDTH_CLASS[maxWidth],
                !noPadding && "px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8",
                contentClassName,
              )}
            >
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  )
}
