/**
 * Mappers to convert API DTOs to frontend types.
 */

import type { Islander, IslanderDetail } from "@/app/types/islander"
import type { LandingPageContent, VideoClip, VideoSectionContent } from "@/app/types/landing"
import { getUploadsUrl } from "./api-server"

/** Map API IslanderListItemDto to frontend Islander (without status transformation) */
export function mapIslanderListItem(dto: {
  firstName: string
  lastName: string | null
  age: number
  location: string
  tagline: string | null
  profileImage: string | null
  profileStatusLabel?: string | null
  slug: string
  status?: string
}): Omit<Islander, "status"> & { status?: string } {
  return {
    name: dto.lastName ? `${dto.firstName} ${dto.lastName}` : dto.firstName,
    age: dto.age,
    location: dto.location,
    tagline: dto.tagline || "",
    image: dto.profileImage ? getUploadsUrl(dto.profileImage) : "/placeholder-user.jpg",
    slug: dto.slug,
    status: dto.status,
    profileStatusLabel: dto.profileStatusLabel ?? null,
  }
}

/** Map API status to IslanderDetail status */
function formatStatus(status: string): Islander["status"] {
  const statusMap: Record<string, Islander["status"]> = {
    cast: "Active",
    in_villa: "Active",
    coupled: "Coupled",
    eliminated: "Eliminated",
    winner: "Winner",
    active: "Active",
    evicted: "Evicted",
  }
  return statusMap[status] ?? "Active"
}

/** Map API IslanderDetailDto to frontend IslanderDetail */
export function mapIslanderDetail(dto: {
  firstName: string
  lastName: string | null
  age: number
  location: string
  tagline: string | null
  profileImage: string | null
  profileStatusLabel?: string | null
  coverImage: string | null
  occupation: string | null
  bio: string | null
  lookingFor: string | null
  funFacts: Array<{ icon: string; label: string; value: string }> | null
  socialLinks: Array<{ platform: string; handle: string; url: string }> | null
  status: string
  slug: string
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: string | null
  twitterImage?: string | null
  keywords?: string | null
  video?: { src: string; poster?: string; title: string; description?: string } | null
  media?: Array<{ type: string; storageKey: string; displayOrder: number; altText?: string | null }>
}): IslanderDetail {
  const gallery: { src: string; alt: string }[] = []
  let video: IslanderDetail["video"] = null

  if (dto.media?.length) {
    const galleryMedia = dto.media
      .filter((m) => m.type === "gallery")
      .sort((a, b) => a.displayOrder - b.displayOrder)
    gallery.push(
      ...galleryMedia.map((m) => ({
        src: getUploadsUrl(m.storageKey),
        alt: m.altText || "Gallery photo",
      }))
    )
    const videoMedia = dto.media.find((m) => m.type === "video")
    if (videoMedia) {
      video = {
        src: getUploadsUrl(videoMedia.storageKey, "video"),
        title: "Introduction",
        description: undefined,
      }
    }
  }

  return {
    name: dto.lastName ? `${dto.firstName} ${dto.lastName}` : dto.firstName,
    age: dto.age,
    location: dto.location,
    tagline: dto.tagline || "",
    image: dto.profileImage ? getUploadsUrl(dto.profileImage) : "/placeholder-user.jpg",
    slug: dto.slug,
    occupation: dto.occupation || "",
    status: formatStatus(dto.status),
    profileStatusLabel: dto.profileStatusLabel ?? null,
    coverImage: "/images/hero-bg.jpg", // Same static cover as landing page hero
    bio: dto.bio || "",
    lookingFor: dto.lookingFor || "",
    funFacts: dto.funFacts || [],
    gallery,
    socials: dto.socialLinks || [],
    video: dto.video ?? video,
    metaTitle: dto.metaTitle,
    metaDescription: dto.metaDescription,
    ogImage: dto.ogImage ? getUploadsUrl(dto.ogImage) : undefined,
    twitterImage: dto.twitterImage ? getUploadsUrl(dto.twitterImage) : undefined,
    keywords: dto.keywords,
  }
}

/** Map API LandingContentDto to frontend LandingPageContent */
export function mapLandingContent(
  apiContent: {
    hero: any
    countdown: any
    videos: any
    sponsors: any
  },
  islanders: Islander[],
): LandingPageContent {
  return {
    hero: apiContent.hero,
    countdown: apiContent.countdown,
    islanders,
    videos: apiContent.videos,
    sponsors: apiContent.sponsors,
  }
}

type PublishedVideoListItem = {
  slug: string
  title: string
  description: string | null
  embedUrl: string
  thumbnail: string | null
  duration: string | null
  tag: string | null
  displayOrder: number
  createdAt: string
}

/**
 * When there are published videos, the first (by display order) becomes the featured embed
 * and the rest populate the carousel. Section copy (label, title, description, CTA) stays from CMS.
 */
export function mergePublishedVideosIntoVideoSection(
  section: VideoSectionContent,
  published: PublishedVideoListItem[],
): VideoSectionContent {
  if (!published.length) return section

  const sorted = [...published].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const [first, ...rest] = sorted

  const clips: VideoClip[] = rest.map((v) => ({
    title: v.title,
    description: v.description ?? "",
    duration: v.duration?.trim() ? v.duration : "",
    image: v.thumbnail ? getUploadsUrl(v.thumbnail) : "/placeholder.svg",
    tag: v.tag?.trim() ? v.tag : "Clip",
    embedUrl: v.embedUrl,
    slug: v.slug,
  }))

  return {
    ...section,
    featuredVideo: {
      embedUrl: first.embedUrl,
      title: first.title,
      description: first.description ?? undefined,
    },
    clips,
  }
}
