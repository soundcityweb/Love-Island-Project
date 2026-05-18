import Link from "next/link"

import { cn } from "@/lib/utils"

/** Nigeria flag — inline SVG for wordmark lockup (same aspect as public header). */
function NigeriaFlagIcon({
  className,
  compact,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      width={compact ? 12 : 14}
      height={compact ? 8 : 10}
      role="img"
      aria-label="Nigeria flag"
      className={cn("inline-block shrink-0", className)}
    >
      <title>Nigeria flag</title>
      <rect width="900" height="600" fill="#008751" />
      <rect x="300" width="300" height="600" fill="#fff" />
    </svg>
  )
}

export type SiteLogoProps = {
  href?: string
  /**
   * `on-dark`: light wordmark for transparent / dark bars (SiteHeader, footer on `bg-foreground`).
   * `on-light`: dark wordmark for light backgrounds (InnerHeader, admin top bar).
   */
  variant?: "on-dark" | "on-light"
  className?: string
  /** Override default wordmark typography (size still matches header unless you change it). */
  wordmarkClassName?: string
  /**
   * When false, only the Nigeria pill + flag (e.g. narrow admin sidebar when collapsed).
   */
  showWordmark?: boolean
  /** Slightly smaller lockup for tight chrome (admin sidebar, admin header). */
  compact?: boolean
}

/**
 * Canonical public brand lockup — same mark as the main site header everywhere it appears.
 */
export function SiteLogo({
  href = "/",
  variant = "on-dark",
  className,
  wordmarkClassName,
  showWordmark = true,
  compact = false,
}: SiteLogoProps) {
  const wordmarkDefault = compact
    ? variant === "on-dark"
      ? "text-sm font-bold tracking-tight text-primary-foreground"
      : "text-sm font-bold tracking-tight text-foreground"
    : variant === "on-dark"
      ? "text-xl font-bold tracking-tight text-primary-foreground"
      : "text-xl font-bold tracking-tight text-foreground"

  return (
    <Link href={href} className={cn("flex shrink-0 items-center gap-2", className)}>
      {showWordmark && (
        <span className={cn(wordmarkDefault, wordmarkClassName)}>LOVE ISLAND</span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-primary font-bold tracking-wider text-primary-foreground",
          compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        )}
      >
        <NigeriaFlagIcon compact={compact} />
        NIGERIA
      </span>
    </Link>
  )
}

/**
 * Narrow chrome (e.g. collapsed admin sidebar): same flag mark as the full lockup, icon-only.
 */
export function SiteLogoIconMark({
  href = "/",
  className,
  "aria-label": ariaLabel = "Love Island Nigeria",
}: {
  href?: string
  className?: string
  "aria-label"?: string
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30",
        className,
      )}
    >
      <NigeriaFlagIcon compact className="rounded-[2px]" />
    </Link>
  )
}
