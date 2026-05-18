/**
 * Master list of site navigation links (legacy + `nav()` helper).
 */
export const NAV_LINKS = [
  { label: "Islanders", href: "/islanders" },
  { label: "Videos", href: "/videos" },
  { label: "Schedule", href: "/schedule" },
  { label: "News", href: "/news" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "Vote", href: "/vote" },
  { label: "Shop", href: "/shop" },
] as const

export type NavLabel = (typeof NAV_LINKS)[number]["label"]

export function nav(
  label: NavLabel,
  active = false,
): { label: string; href: string; active?: true } {
  const item = NAV_LINKS.find((n) => n.label === label)!
  if (active) return { label: item.label, href: item.href, active: true }
  return { label: item.label, href: item.href }
}

// ─── Primary header nav (desktop + overlay mobile), fixed order ─────────────

export type MainNavLink = {
  label: string
  href: string
  active?: boolean
  /** Renders as primary brand pill (Vote). */
  cta?: boolean
}

const MAIN_HEADER_TEMPLATE = [
  { label: "Islanders", href: "/islanders" },
  { label: "Vote", href: "/vote", cta: true as const },
  { label: "Competitions", href: "/competitions" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "Videos", href: "/videos" },
  { label: "Schedule", href: "/schedule" },
  { label: "News", href: "/news" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
  { label: "Apply", href: "/apply" },
] as const

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Main public nav with `active` derived from pathname.
 * On the home page, Islanders points to `/#islanders` for in-page scroll.
 */
export function mainNavForPathname(pathname: string): MainNavLink[] {
  return MAIN_HEADER_TEMPLATE.map((item) => {
    let href: string = item.href
    if (item.label === "Islanders" && pathname === "/") {
      href = "/#islanders"
    }
    return {
      label: item.label,
      href,
      cta: "cta" in item ? item.cta : undefined,
      active: isNavActive(pathname, item.href),
    }
  })
}

