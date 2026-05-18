"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SiteHeader, InnerHeader } from "@/components/layout/Header"
import { SiteFooter } from "@/components/layout/Footer"
import { CartBadge } from "@/components/shop/cart-badge"
import { mainNavForPathname } from "@/config/navigation"

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Admin pages manage their own chrome entirely. */
function isNoChromePath(p: string) {
  return p.startsWith("/admin")
}

/** Hero-backed pages use the transparent overlay SiteHeader. */
function isOverlayPath(p: string) {
  return p === "/" || p === "/vote" || p.startsWith("/islanders/") || p === "/apply"
}

/** Pages where the footer should be suppressed. */
function isNoFooterPath(p: string) {
  return p === "/shop/checkout/callback" || p === "/apply"
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function CartIconButton() {
  return (
    <Link
      href="/shop/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      aria-label="View cart"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      <CartBadge />
    </Link>
  )
}

function SecureCheckoutSlot() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
      <span className="hidden font-medium sm:inline">Secure Checkout</span>
    </div>
  )
}

// ─── Per-route header selection ──────────────────────────────────────────────

function getHeader(pathname: string): React.ReactNode {
  // ── Islanders list — gradient hero, same overlay+scroll behaviour as landing ──
  if (pathname === "/islanders") {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  if (isOverlayPath(pathname)) return <SiteHeader />

  // ── News listing — gradient hero, same overlay+scroll behaviour as islanders ──
  if (pathname === "/news") {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── News article detail ──────────────────────────────────────────────────
  if (pathname.startsWith("/news")) {
    return <InnerHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Competitions listing + detail — full-bleed hero, same overlay as News ──
  if (pathname === "/competitions" || pathname.startsWith("/competitions/")) {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Podcast listing — same overlay header as News ─────────────────────
  if (pathname === "/podcasts") {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Schedule — gradient hero + transparent overlay header (News / Podcasts pattern)
  if (pathname === "/schedule") {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── CMS legal / static pages — same overlay header as News / Podcasts (sunset hero)
  if (
    pathname === "/privacy-policy" ||
    pathname === "/terms-conditions" ||
    pathname === "/contact"
  ) {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Podcast episode detail — same inner header pattern as News article ──
  if (pathname.startsWith("/podcasts/")) {
    return <InnerHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Videos listing — same overlay header + hero pattern as News / Podcasts
  if (pathname === "/videos") {
    return <SiteHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Video detail (if added later) — same inner header as news article
  if (pathname.startsWith("/videos/")) {
    return <InnerHeader navLinks={mainNavForPathname(pathname)} />
  }

  // ── Shop: cart page ──────────────────────────────────────────────────────
  if (pathname === "/shop/cart") {
    return (
      <InnerHeader
        logoHref="/shop"
        rightSlot={
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Continue Shopping
            </Link>
            <CartIconButton />
          </div>
        }
      />
    )
  }

  // ── Shop: checkout success (minimal — logo only) ─────────────────────────
  if (pathname === "/shop/checkout/success") {
    return <InnerHeader />
  }

  // ── Shop: checkout flow (checkout + callback) ────────────────────────────
  if (pathname.startsWith("/shop/checkout")) {
    return <InnerHeader rightSlot={<SecureCheckoutSlot />} />
  }

  // ── Shop: product listing + product detail ───────────────────────────────
  if (pathname.startsWith("/shop")) {
    return (
      <InnerHeader navLinks={mainNavForPathname(pathname)} rightSlot={<CartIconButton />} />
    )
  }

  // ── Default fallback ─────────────────────────────────────────────────────
  return <InnerHeader navLinks={mainNavForPathname(pathname)} />
}

// ─── Component ──────────────────────────────────────────────────────────────

export function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isNoChromePath(pathname)) return <>{children}</>

  return (
    <>
      {getHeader(pathname)}
      {children}
      {!isNoFooterPath(pathname) && <SiteFooter />}
    </>
  )
}
