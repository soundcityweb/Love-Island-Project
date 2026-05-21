import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

export type SiteLogoProps = {
  href?: string
  /**
   * `on-dark`: used on transparent / dark bars (SiteHeader, footer).
   * `on-light`: used on light backgrounds (InnerHeader, admin top bar).
   */
  variant?: "on-dark" | "on-light"
  className?: string
  /** @deprecated — no longer used; kept for API compatibility. */
  wordmarkClassName?: string
  /** @deprecated — no longer used; kept for API compatibility. */
  showWordmark?: boolean
  /** Slightly smaller lockup for tight chrome (admin sidebar, admin header). */
  compact?: boolean
}

/**
 * Canonical public brand lockup — same mark as the main site header everywhere it appears.
 */
export function SiteLogo({
  href = "/",
  className,
  compact = false,
}: SiteLogoProps) {
  return (
    <Link href={href} className={cn("flex shrink-0 items-center", className)}>
      <Image
        src="/images/logo-white.png"
        alt="Love Island Nigeria"
        width={compact ? 123 : 171}
        height={compact ? 36 : 50}
        className="object-contain"
        priority
      />
    </Link>
  )
}

/**
 * Narrow chrome (e.g. collapsed admin sidebar): icon-only logo mark.
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
      className={cn("flex shrink-0 items-center justify-center", className)}
    >
      <Image
        src="/images/logo-icon.png"
        alt="Love Island Nigeria"
        width={40}
        height={40}
        className="object-contain"
        priority
      />
    </Link>
  )
}
