"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  UserCircle2,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Public types ──────────────────────────────────────────────────────────────

export interface NavbarUser {
  name: string
  email: string
  /** If provided, renders an <img> avatar; otherwise falls back to `initials` */
  avatarUrl?: string
  /** Shown inside the avatar circle when no `avatarUrl`. Defaults to first letter of `name`. */
  initials?: string
}

export interface NavbarNotifications {
  /** Number of unread notifications. 0 hides the badge entirely. */
  count: number
  onClick?: () => void
}

export interface NavbarDropdownItem {
  icon: LucideIcon
  label: string
  /** Render as a link when provided, otherwise a button */
  href?: string
  onClick?: () => void
  /** Renders a divider line above this item */
  separator?: boolean
  variant?: "default" | "danger"
}

export interface AdminNavbarProps {
  /** Primary heading rendered in the bar */
  title: string
  /** Optional secondary line below the title (e.g. "3 items selected") */
  subtitle?: string
  /** Called when the mobile hamburger is tapped */
  onMenuToggle: () => void
  /**
   * Tailwind `left-*` class(es) that offset the bar to sit flush with the sidebar.
   * e.g. `"lg:left-[260px]"` or `"lg:left-[72px]"` when collapsed.
   */
  sidebarOffset: string
  /** User displayed in the avatar + dropdown header */
  user?: NavbarUser
  /** Bell icon notification state */
  notifications?: NavbarNotifications
  /** Placeholder text for the search input */
  searchPlaceholder?: string
  /** Called with the current query on every keystroke */
  onSearch?: (query: string) => void
  /**
   * Dropdown menu items. Defaults to Profile / Settings / Sign out.
   * Pass an empty array to hide the dropdown entirely.
   */
  dropdownItems?: NavbarDropdownItem[]
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_USER: NavbarUser = {
  name: "Admin",
  email: "admin@loveisland.ng",
  initials: "A",
}

const DEFAULT_NOTIFICATIONS: NavbarNotifications = { count: 0 }

const DEFAULT_DROPDOWN: NavbarDropdownItem[] = [
  { icon: UserCircle2, label: "Profile & Security",       href: "/admin/profile"  },
  { icon: LogOut,      label: "Sign out",          separator: true, variant: "danger" },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminNavbar({
  title,
  subtitle,
  onMenuToggle,
  sidebarOffset,
  user = DEFAULT_USER,
  notifications = DEFAULT_NOTIFICATIONS,
  searchPlaceholder = "Search…",
  onSearch,
  dropdownItems = DEFAULT_DROPDOWN,
}: AdminNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const initials = user.initials ?? user.name.charAt(0).toUpperCase()
  const hasDropdown = dropdownItems.length > 0

  return (
    <header
      className={cn(
        // Layout
        "fixed right-0 top-0 z-20 flex h-16 items-center gap-3 px-4 lg:px-6",
        // Glassmorphism
        "border-b border-white/[0.06] bg-card/70 backdrop-blur-xl backdrop-saturate-150",
        // Shadow
        "shadow-[0_1px_0_0_hsl(var(--border))]",
        // Sidebar tracking
        "transition-[left] duration-300",
        sidebarOffset,
      )}
    >
      {/* ── Mobile hamburger ─────────────────────────── */}
      <button
        onClick={onMenuToggle}
        aria-label="Open sidebar"
        className="flex shrink-0 items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {/* ── Page title ───────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold tracking-tight text-foreground lg:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[11px] text-muted-foreground leading-none mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Search ───────────────────────────────────── */}
      {/* <label className="group hidden w-44 cursor-text items-center gap-2 rounded-xl border border-input bg-muted/40 px-3 py-2 transition-all duration-200 focus-within:w-64 focus-within:border-primary/60 focus-within:bg-muted focus-within:ring-2 focus-within:ring-primary/15 md:flex lg:w-56 lg:focus-within:w-72">
        <Search
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
          aria-hidden
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label="Search admin"
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label> */}

      {/* ── Notifications ────────────────────────────── */}
      {/* <button
        onClick={notifications.onClick}
        aria-label={
          notifications.count > 0
            ? `${notifications.count} unread notifications`
            : "Notifications"
        }
        className="relative flex shrink-0 items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden />

        {notifications.count > 0 && (
          <span
            className={cn(
              "absolute right-1 top-1 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold tabular-nums text-primary-foreground ring-2 ring-card",
              notifications.count > 9 ? "h-4 min-w-[16px] px-0.5" : "h-4 w-4",
            )}
          >
            {notifications.count > 99 ? "99+" : notifications.count}
          </span>
        )}
      </button> */}

      {/* ── Profile dropdown ─────────────────────────── */}
      {hasDropdown && (
        <div className="relative shrink-0" ref={profileRef}>
          {/* Trigger button */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Open user menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-muted"
          >
            <Avatar user={user} initials={initials} />

            <div className="hidden text-left md:block">
              <p className="max-w-[120px] truncate text-sm font-semibold leading-tight text-foreground">
                {user.name}
              </p>
              <p className="max-w-[120px] truncate text-[11px] leading-tight text-muted-foreground">
                {user.email}
              </p>
            </div>

            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                profileOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {/* Dropdown panel */}
          {profileOpen && (
            <div
              role="menu"
              className={cn(
                "absolute right-0 top-[calc(100%+6px)] z-40 w-60 overflow-hidden",
                "rounded-2xl border border-white/[0.08] bg-card/95 shadow-2xl shadow-black/30 backdrop-blur-xl",
                // Entrance animation (tailwindcss-animate)
                "animate-in fade-in slide-in-from-top-2 duration-150",
              )}
            >
              {/* User header */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                <Avatar user={user} initials={initials} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5" role="none">
                {dropdownItems.map((item, i) => (
                  <DropdownItem
                    key={`${item.label}-${i}`}
                    item={item}
                    onClose={() => setProfileOpen(false)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  user: NavbarUser
  initials: string
  size?: "sm" | "lg"
}

function Avatar({ user, initials, size = "sm" }: AvatarProps) {
  const dim = size === "lg" ? "h-9 w-9 text-base" : "h-8 w-8 text-sm"

  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.name}
        width={size === "lg" ? 36 : 32}
        height={size === "lg" ? 36 : 32}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-primary/30",
          dim,
        )}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary ring-2 ring-primary/30",
        dim,
      )}
    >
      {initials}
    </div>
  )
}

// ── DropdownItem ──────────────────────────────────────────────────────────────

interface DropdownItemProps {
  item: NavbarDropdownItem
  onClose: () => void
}

function DropdownItem({ item, onClose }: DropdownItemProps) {
  const isDanger = item.variant === "danger"

  const className = cn(
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
    isDanger
      ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )

  const content = (
    <>
      <item.icon className="h-4 w-4 shrink-0" aria-hidden />
      {item.label}
    </>
  )

  return (
    <>
      {item.separator && <div className="my-1 h-px bg-border" role="separator" />}

      {item.href ? (
        <Link href={item.href} role="menuitem" className={className} onClick={onClose}>
          {content}
        </Link>
      ) : (
        <button
          role="menuitem"
          className={className}
          onClick={() => {
            item.onClick?.()
            onClose()
          }}
        >
          {content}
        </button>
      )}
    </>
  )
}
