/**
 * Landing page content types.
 * Used to type props for landing page sections.
 */

import type { Islander } from "./islander"

// Re-export for convenience
export type { Islander }

export interface HeroContent {
  season: string
  title: string
  titleHighlight: string
  description: string
  ctaPrimary: {
    label: string
    href: string
  }
  ctaSecondary: {
    label: string
    href: string
  }
  stats: {
    applicants: string
    days: string
    winningCouple: string
  }
  backgroundImage: string
}

export interface CountdownContent {
  label: string
  title: string
  /**
   * ISO-8601 target date/time for the live countdown timer.
   * When present the component computes remaining time dynamically.
   * When absent it falls back to the static `timeUnits` values.
   */
  targetDate?: string
  timeUnits: Array<{
    label: string
    value: string
  }>
  footerText: string
}

export interface VideoClip {
  title: string
  description: string
  duration: string
  image: string
  tag: string
  /** Set when the clip comes from a published video — opens the embed in a modal. */
  embedUrl?: string
  slug?: string
}

export interface VideoSectionContent {
  label: string
  title: string
  description: string
  featuredVideo: {
    embedUrl: string
    title: string
    /** Optional; shown under the title with a 2-line clamp on the featured tile. */
    description?: string | null
  }
  clips: VideoClip[]
  ctaLabel: string
  ctaHref: string
}

export interface Sponsor {
  name: string
  tier: string
}

export interface SponsorsContent {
  label: string
  title: string
  description: string
  titleSponsors: Sponsor[]
  officialPartners: Sponsor[]
  cta: {
    label: string
    title: string
    description: string
    buttonLabel: string
    href: string
  }
}

export interface LandingPageContent {
  hero: HeroContent
  countdown: CountdownContent
  islanders: Islander[]
  videos: VideoSectionContent
  sponsors: SponsorsContent
}
