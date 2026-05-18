/**
 * Islander types for detail pages and API responses.
 */

/** Basic islander info (used in listings) */
export interface Islander {
  name: string
  age: number
  location: string
  tagline: string
  image: string
  slug: string
  status: "Active" | "Evicted" | "Coupled" | "Eliminated" | "Winner"
  profileStatusLabel?: string | null
}

/** Fun fact item */
export interface FunFact {
  icon: string
  label: string
  value: string
}

/** Gallery image */
export interface GalleryImage {
  src: string
  alt: string
}

/** Social media link */
export interface SocialLink {
  platform: string
  handle: string
  url: string
}

/** Video asset for profile page */
export interface IslanderVideo {
  src: string
  poster?: string
  title: string
  description?: string
}

/** Full islander detail (used in profile pages) */
export interface IslanderDetail extends Islander {
  occupation: string
  coverImage: string
  bio: string
  lookingFor: string
  funFacts: FunFact[]
  gallery: GalleryImage[]
  socials: SocialLink[]
  video?: IslanderVideo | null
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: string | null
  twitterImage?: string | null
  keywords?: string | null
}
