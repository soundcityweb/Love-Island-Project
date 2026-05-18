/**
 * Application types for admin pages, API responses, and application form.
 */

export type ApplicationStatus = "submitted" | "under_review" | "accepted" | "rejected"

export interface ApplicationMedia {
  id: string
  type: "image" | "video"
  storageKey: string
  altText?: string | null
  displayOrder: number
}

/** Fun fact item (matches islander profile shape) */
export interface FunFact {
  icon: string
  label: string
  value: string
}

/** Social link item (matches islander profile shape) */
export interface SocialLink {
  platform: string
  handle: string
  url: string
}

/** Static icon options for fun facts (same as ProfileFunFacts) */
export const FUN_FACT_ICON_OPTIONS = [
  "heart",
  "music",
  "food",
  "sparkle",
  "sun",
  "flame",
] as const

/** Static platform options for social links (same as ProfileSocial) */
export const SOCIAL_PLATFORM_OPTIONS = [
  "instagram",
  "twitter",
  "x",
  "tiktok",
] as const

/** Form data for the contestant application form */
export interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  gender: string
  city: string
  occupation: string
  bio: string
  tagline?: string
  lookingFor?: string
  profileStatusLabel?: string
  funFacts?: FunFact[]
  socialLinks?: SocialLink[]
}

export interface ApplicationStepConfig {
  label: string
  description: string
}

/** Payload when submitting the application form */
export interface ApplicationSubmitPayload {
  formData: ApplicationFormData
  images: File[]
  video: File | null
  primaryImageIndex?: number
}

/** Validation errors for personal info step */
export interface PersonalInfoErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  age?: string
  gender?: string
  city?: string
  occupation?: string
  bio?: string
  tagline?: string
  lookingFor?: string
  profileStatusLabel?: string
  funFacts?: string
  socialLinks?: string
}

export interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: string
  city: string
  occupation: string
  bio: string
  tagline?: string | null
  lookingFor?: string | null
  profileStatusLabel?: string | null
  funFacts?: FunFact[] | null
  socialLinks?: SocialLink[] | null
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  media?: ApplicationMedia[]
}
