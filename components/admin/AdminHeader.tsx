"use client"

/**
 * Shared sticky header for admin section pages (Applications, Voting,
 * Results, Products, Orders, and the Dashboard root).
 *
 * Usage:
 *   // Dashboard (no title → "Admin Dashboard" label, full ADMIN_NAV highlighted by pathname)
 *   <AdminHeader />
 *
 *   // Section page (string breadcrumb, custom nav items)
 *   <AdminHeader title="Orders" adminLink navItems={[...]} />
 *
 *   // Deep page (ReactNode breadcrumb for multi-level paths)
 *   <AdminHeader adminLink title={<>Orders / <span>{order.orderNumber}</span></>} navItems={[...]} />
 */

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ADMIN_NAV } from "@/app/lib/admin-dashboard"
import { SiteLogo } from "@/components/layout/SiteLogo"

type NavItem = { label: string; href: string; active?: boolean }

type AdminHeaderProps = {
  /**
   * Breadcrumb label shown after "Admin /".
   * Pass a string for simple names ("Orders") or ReactNode for deep paths.
   * Omit to render the top-level "Admin Dashboard" title instead.
   */
  title?: React.ReactNode
  /**
   * When true, "Admin" in the breadcrumb becomes a link to /admin/applications.
   * Defaults to false (plain text).
   */
  adminLink?: boolean
  /**
   * Nav items rendered on the right.
   * Omit to auto-render ADMIN_NAV with the active item detected from pathname.
   */
  navItems?: NavItem[]
}

export function AdminHeader({
  title,
  adminLink = false,
  navItems,
}: AdminHeaderProps) {
  const pathname = usePathname()

  const nav: NavItem[] = navItems ??
    ADMIN_NAV.map((item) => ({
      label: item.label,
      href: item.href,
      active: pathname === item.href,
    }))

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Left: site lockup + breadcrumb or dashboard title */}
        <div className="flex min-w-0 items-center gap-3">
          <SiteLogo
            href="/admin"
            variant="on-light"
            compact
            wordmarkClassName="text-foreground"
            className="max-w-[min(100%,11rem)] shrink"
          />

          {title ? (
            <div className="flex items-center gap-2 text-sm">
              {adminLink ? (
                <Link
                  href="/admin/applications"
                  className="font-bold text-foreground transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              ) : (
                <span className="font-bold text-foreground">Admin</span>
              )}
              <span className="text-muted-foreground">/</span>
              {typeof title === "string" ? (
                <span className="text-muted-foreground">{title}</span>
              ) : (
                title
              )}
            </div>
          ) : (
            <span className="text-sm font-bold text-foreground">Admin Dashboard</span>
          )}
        </div>

        {/* Right: nav links */}
        <nav className="flex items-center gap-1" aria-label="Admin navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={
                item.active
                  ? "rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                  : "rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
