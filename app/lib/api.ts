/** API base URL (Nest server origin). Inlined at build time from NEXT_PUBLIC_API_URL. */
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:3000"

function getBaseUrl(): string {
  return API_BASE_URL
}

/** Form fields for POST /applications (field names match API CreateApplicationDto) */
export interface CreateApplicationFields {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: string
  city: string
  occupation: string
  bio: string
  tagline?: string
  lookingFor?: string
  profileStatusLabel?: string
  primaryImageIndex?: number
  funFacts?: Array<{ icon: string; label: string; value: string }>
  socialLinks?: Array<{ platform: string; handle: string; url: string }>
}

/** Payload for createApplication: form fields + optional files */
export interface CreateApplicationPayload {
  fields: CreateApplicationFields
  images: File[]
  video: File | null
  primaryImageIndex?: number
}

/** Response from POST /applications (application entity) */
export interface CreateApplicationResponse {
  id: string
  status: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: string
  city: string
  occupation: string
  bio: string
  createdAt: string
  updatedAt: string
}

export async function createApplication(
  payload: CreateApplicationPayload
): Promise<CreateApplicationResponse> {
  const base = getBaseUrl()
  const form = new FormData()
  const { fields, images, video, primaryImageIndex } = payload

  form.append("firstName", fields.firstName)
  form.append("lastName", fields.lastName)
  form.append("email", fields.email)
  form.append("phone", fields.phone)
  form.append("age", String(fields.age))
  form.append("gender", fields.gender)
  form.append("city", fields.city)
  form.append("occupation", fields.occupation)
  form.append("bio", fields.bio)
  if (fields.tagline !== undefined && fields.tagline !== "")
    form.append("tagline", fields.tagline)
  if (fields.lookingFor !== undefined && fields.lookingFor !== "")
    form.append("lookingFor", fields.lookingFor)
  if (fields.profileStatusLabel !== undefined && fields.profileStatusLabel !== "")
    form.append("profileStatusLabel", fields.profileStatusLabel)
  form.append("primaryImageIndex", String(primaryImageIndex ?? 0))
  if (fields.funFacts !== undefined && fields.funFacts.length > 0)
    form.append("funFacts", JSON.stringify(fields.funFacts))
  if (fields.socialLinks !== undefined && fields.socialLinks.length > 0)
    form.append("socialLinks", JSON.stringify(fields.socialLinks))

  for (const file of images) {
    form.append("images", file, file.name)
  }
  if (video) {
    form.append("video", video, video.name)
  }

  const res = await fetch(`${base}/api/applications`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    let message: string
    try {
      const json = JSON.parse(text) as { message?: string | string[] }
      message = Array.isArray(json.message) ? json.message.join(", ") : json.message ?? text
    } catch {
      message = text || res.statusText || "Something went wrong"
    }
    throw new Error(message)
  }

  return res.json()
}
