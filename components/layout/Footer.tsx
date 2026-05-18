"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { SiteLogo } from "@/components/layout/SiteLogo"

const footerNav = {
  show: [
    { label: "Islanders", href: "/islanders" },
    { label: "Videos", href: "/videos" },
    { label: "Schedule", href: "/schedule" },
    { label: "News", href: "/news" },
    { label: "Podcasts", href: "/podcasts" },
  ],
  engage: [
    { label: "Vote", href: "/vote" },
    { label: "Competitions", href: "/competitions" },
    { label: "Be an Islander", href: "/apply" },
    { label: "Merch Store", href: "/shop" },
  ],
  social: [
    { label: "Instagram", href: "#" },
    { label: "X (Twitter)", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "YouTube", href: "#" },
  ],
}

function isFooterLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteFooter() {
  const pathname = usePathname()

  return (
    <footer className="border-t border-border bg-foreground">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <SiteLogo variant="on-dark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/50">
              Nigeria&apos;s hottest show. Follow every couple-up, every
              heartbreak, and every shocking twist. You won&apos;t want to miss a
              single episode.
            </p>
            {/* Social */}
            <div className="mt-6 flex flex-wrap gap-4">
              {footerNav.social.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-sm font-medium text-primary-foreground/40 transition-colors hover:text-primary"
                  aria-label={`Follow us on ${social.label}`}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Show links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-foreground/40">
              The Show
            </h4>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Show links">
              {footerNav.show.map((link) => {
                const active = isFooterLinkActive(pathname, link.href)
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-sm transition-colors",
                      active
                        ? "font-semibold text-primary underline decoration-primary decoration-2 underline-offset-4"
                        : "text-primary-foreground/60 hover:text-primary-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Engage links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-foreground/40">
              Get Involved
            </h4>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Engagement links">
              {footerNav.engage.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-foreground/40">
              Legal
            </h4>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Legal links">
              <Link
                href="/privacy-policy"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-conditions"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
              >
                Terms & Conditions
              </Link>
              <Link href="/contact" className="text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-xs text-primary-foreground/30">
            &copy; 2026 Love Island Nigeria. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/30">
            Catch every episode on Soundcity, Spice, ONTV & digital platforms
          </p>
        </div>
      </div>
    </footer>
  )
}
