"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { mainNavForPathname, type MainNavLink } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { SiteLogo } from "@/components/layout/SiteLogo"

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavLink = MainNavLink

// ─── SiteHeader ───────────────────────────────────────────────────────────────
// Transparent overlay header with mobile hamburger menu.
// Used on hero-backed pages: home, vote, islander profile.

export function SiteHeader({ navLinks: navLinksProp }: { navLinks?: NavLink[] } = {}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = navLinksProp ?? mainNavForPathname(pathname)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "bg-foreground/90 backdrop-blur-md border-b border-primary-foreground/10 shadow-sm"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center px-6 py-5 lg:px-8">
        <SiteLogo variant="on-dark" />

        {/* Desktop Nav — flex-1 centers group; mobile uses ml-auto on menu control */}
        <nav
          className="ml-4 hidden min-w-0 flex-1 items-center justify-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={link.active && !link.cta ? "page" : undefined}
              className={cn(
                link.cta
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-primary/90"
                  : "text-sm font-medium text-primary-foreground/80 transition-all duration-200 hover:-translate-y-px hover:text-primary-foreground",
                !link.cta &&
                  link.active &&
                  "font-bold text-primary-foreground underline decoration-primary decoration-2 underline-offset-8",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="ml-auto shrink-0 text-primary-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav — same link order as desktop */}
      {mobileOpen && (
        <nav
          className="border-t border-primary-foreground/10 bg-foreground/95 px-6 pb-6 pt-4 backdrop-blur-md lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={link.active && !link.cta ? "page" : undefined}
                  className={cn(
                    link.cta
                      ? "inline-flex rounded-full bg-primary px-4 py-2.5 text-base font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      : "text-base font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground",
                    !link.cta && link.active && "text-primary-foreground",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

// ─── InnerHeader ──────────────────────────────────────────────────────────────
// Solid sticky header for inner pages (islanders, news, shop, videos, etc.).
// Accepts nav links and an optional right-side slot for CTAs, cart icons, etc.

type InnerHeaderProps = {
  navLinks?: NavLink[]
  /** Overrides the full `<header>` element class. */
  className?: string
  /** Overrides the inner container class. */
  innerClassName?: string
  /** Class for the active (current page) nav link. */
  activeLinkClass?: string
  /** Class for inactive nav links. */
  inactiveLinkClass?: string
  /** Overrides the logo "LOVE ISLAND" text class. */
  logoTextClass?: string
  /** Overrides the logo `href` (default: "/"). */
  logoHref?: string
  /** Content rendered on the right side of the header (CTA, cart, back link…). */
  rightSlot?: React.ReactNode
}

export function InnerHeader({
  navLinks,
  className = "sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md",
  innerClassName = "mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8",
  activeLinkClass =
    "text-sm font-bold text-foreground underline decoration-primary decoration-2 underline-offset-8",
  inactiveLinkClass = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
  logoTextClass,
  logoHref = "/",
  rightSlot,
}: InnerHeaderProps) {
  return (
    <header className={className}>
      <div className={innerClassName}>
        <SiteLogo
          href={logoHref}
          variant="on-light"
          wordmarkClassName={logoTextClass}
        />

        {/* Desktop Nav */}
        {navLinks && navLinks.length > 0 && (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={link.active && !link.cta ? "page" : undefined}
                className={
                  link.cta
                    ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    : link.active
                      ? activeLinkClass
                      : inactiveLinkClass
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right slot */}
        {rightSlot}
      </div>
    </header>
  )
}
