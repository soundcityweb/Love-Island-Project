/**
 * Mappers to convert API DTOs to frontend admin types.
 */

import type { Application, ApplicationMedia } from "@/app/types/application"
import type { ListApplicationsResponse, ApplicationResponse } from "./api-admin"
import { getUploadsUrl } from "./api-server"

type ApiApplication = ListApplicationsResponse["data"][0] | ApplicationResponse
type ApiApplicationMedia = NonNullable<ApiApplication["media"]>[number]

/**
 * Map API ApplicationMedia to frontend ApplicationMedia
 */
function mapApplicationMedia(
  media: ApiApplicationMedia
): ApplicationMedia {
  const resourceType = media.type === "video" ? "video" : "image"
  return {
    id: media.id,
    type: resourceType,
    storageKey: getUploadsUrl(media.storageKey, resourceType),
    altText: null,
    displayOrder: media.sortOrder,
  }
}

/**
 * Map API Application to frontend Application
 */
export function mapApplication(
  apiApp: ApiApplication
): Application {
  return {
    id: apiApp.id,
    firstName: apiApp.firstName,
    lastName: apiApp.lastName,
    email: apiApp.email,
    phone: apiApp.phone,
    age: apiApp.age,
    gender: apiApp.gender,
    city: apiApp.city,
    occupation: apiApp.occupation,
    bio: apiApp.bio,
    tagline: (apiApp as { tagline?: string | null }).tagline ?? undefined,
    lookingFor: (apiApp as { lookingFor?: string | null }).lookingFor ?? undefined,
    profileStatusLabel: (apiApp as { profileStatusLabel?: string | null }).profileStatusLabel ?? undefined,
    funFacts: (apiApp as { funFacts?: Array<{ icon: string; label: string; value: string }> | null }).funFacts ?? undefined,
    socialLinks: (apiApp as { socialLinks?: Array<{ platform: string; handle: string; url: string }> | null }).socialLinks ?? undefined,
    status: apiApp.status as Application["status"],
    createdAt: apiApp.createdAt,
    updatedAt: apiApp.updatedAt,
    media: apiApp.media?.map(mapApplicationMedia),
  }
}

/**
 * Map API ListApplicationsResponse to frontend Application[]
 */
export function mapApplicationsResponse(
  response: ListApplicationsResponse
): Application[] {
  return response.data.map(mapApplication)
}

/**
 * Map API ApplicationResponse to frontend Application
 */
export function mapApplicationResponse(
  response: ApplicationResponse
): Application {
  return mapApplication(response)
}
