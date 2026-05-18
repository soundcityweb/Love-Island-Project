/**
 * Server-side API functions for Next.js server components.
 * These run on the server and can use internal URLs or direct database access.
 */

import type { PodcastEpisodePublic } from "@/app/lib/podcasts-public"

/** API base URL for server-side requests (prefers internal Docker URL if set) */
export function getApiBaseUrl(): string {
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

/**
 * Convert a provider-agnostic storage key into a renderable URL.
 *
 * storageKey is the Cloudinary public_id (e.g. "islanders/abc/profile/xyz").
 * Switching providers only requires updating this function — the DB stays clean.
 *
 * resourceType defaults to "image"; pass "video" for video assets so Cloudinary
 * serves the correct delivery URL (/video/upload/ vs /image/upload/).
 *
 * Legacy absolute URLs and local /uploads/ proxy paths are handled for
 * backward compatibility with any pre-migration records.
 */
export function getUploadsUrl(
  storageKey: string | null | undefined,
  resourceType: "image" | "video" = "image",
): string {
  if (!storageKey?.trim()) return ""
  // Already a full URL (external or legacy absolute Cloudinary URL)
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    return storageKey
  }
  // Legacy local path — proxy through Next.js
  if (storageKey.startsWith("/uploads/") || storageKey.startsWith("uploads/")) {
    const key = storageKey.startsWith("/") ? storageKey.slice(1) : storageKey
    return `${process.env.NEXT_PUBLIC_UPLOAD_DIR}/${key}`
  }
  // Cloudinary public_id → construct delivery URL
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
  return `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${storageKey}`
}

/** Fetch landing page content from API */
export async function fetchLandingContent() {
  const base = getApiBaseUrl()
  try {
    const res = await fetch(`${base}/api/landing`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })
    if (!res.ok) {
      return null
    }
    return await res.json()
  } catch (error) {
    // Silently handle connection errors during build/static generation
    // This is expected when API is not running during build time
    return null
  }
}

/** Fetch all public islanders from API */
export async function fetchIslanders() {
  const base = getApiBaseUrl()
  try {
    const res = await fetch(`${base}/api/islanders`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    // Silently handle connection errors during build/static generation
    // This is expected when API is not running during build time
    return []
  }
}

/** Fetch all published videos from API */
export async function fetchVideos() {
  const base = getApiBaseUrl()
  try {
    const res = await fetch(`${base}/api/videos`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Fetch islander by slug from API */
/** Published podcast episodes (public API). */
export async function fetchPodcastsPublished(): Promise<
  import("@/app/lib/podcasts-public").PodcastEpisodePublic[]
> {
  const base = getApiBaseUrl()
  try {
    const res = await fetch(`${base}/api/podcasts`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Single published episode by slug, or null. */
export async function fetchPodcastBySlug(slug: string): Promise<PodcastEpisodePublic | null> {
  const base = getApiBaseUrl()
  try {
    const res = await fetch(`${base}/api/podcasts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchIslanderBySlug(slug: string) {
  const base = getApiBaseUrl()
  try {
    const res = await fetch(`${base}/api/islanders/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })
    if (!res.ok) {
      if (res.status === 404) return null
      return null
    }
    return await res.json()
  } catch (error) {
    // Silently handle connection errors during build/static generation
    // This is expected when API is not running during build time
    return null
  }
}
