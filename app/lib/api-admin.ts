/**
 * Server-side API functions for admin pages.
 * These run on the server and can use internal URLs or direct database access.
 */

/** API base URL for server-side requests (prefers internal Docker URL if set) */
function getApiBaseUrl(): string {
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

// --- Voting events (admin) ---

export interface VotingPeriodItem {
  id: string
  code: string
  name: string
  status: string
  startsAt: string
  endsAt: string
  resultsPublic: boolean
  createdAt: string
  updatedAt: string
  /** From GET /api/votes/periods — live count of vote rows for this period */
  totalVotes?: number
  contestantCount?: number
}

export interface VotingResultRow {
  islanderId: string
  count: number
}

export interface ContestantItem {
  id: string
  firstName: string
  lastName: string | null
  age: number
  location: string
  profileImage: string | null
}

/** List all voting periods (no auth). */
export async function fetchVotingPeriods(): Promise<VotingPeriodItem[]> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/votes/periods`, { next: { revalidate: 0 } })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** Fetch aggregated results for an event (admin only; uses ADMIN_API_KEY). Server-side only. */
export async function fetchVotingEventResults(eventId: string): Promise<VotingResultRow[]> {
  const base = getApiBaseUrl()
  const key = process.env.ADMIN_API_KEY
  if (!key) {
    console.error("[fetchVotingEventResults] ADMIN_API_KEY is not set")
    return []
  }
  const res = await fetch(`${base}/api/admin/voting-events/${eventId}/results`, {
    headers: { "X-Admin-Key": key },
    cache: "no-store",
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** Fetch contestants for an event (public). */
export async function fetchContestantsForEvent(eventId: string): Promise<ContestantItem[]> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/voting-events/${eventId}/contestants`, { cache: "no-store" })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export interface ResultWithName {
  islanderId: string
  name: string
  count: number
}

/** Admin results dashboard analytics (single payload). */
export interface AdminVotingAnalytics {
  eventId: string
  eventName: string
  totalVotes: number
  contestants: Array<{
    islanderId: string
    name: string
    votes: number
    percentage: number
  }>
  timeSeries: Array<{ bucketStart: string; count: number }>
  timeSeriesBucket: "hour" | "day"
}

/** Aggregated analytics for admin results dashboard (one round-trip). */
export async function fetchVotingAnalytics(
  eventId: string,
): Promise<AdminVotingAnalytics> {
  const base = getApiBaseUrl()
  const key = process.env.ADMIN_API_KEY
  if (!key) {
    console.error("[fetchVotingAnalytics] ADMIN_API_KEY is not set")
    throw new Error("Admin API is not configured.")
  }
  const res = await fetch(`${base}/api/admin/voting-events/${eventId}/analytics`, {
    headers: { "X-Admin-Key": key },
    cache: "no-store",
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message =
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(", ")
          : "Failed to load analytics"
    throw new Error(message)
  }
  return res.json() as Promise<AdminVotingAnalytics>
}

/** Fetch results and contestants, merge by islander id. Server-side only for results. */
export async function fetchVotingResultsWithNames(eventId: string): Promise<ResultWithName[]> {
  const [rows, contestants] = await Promise.all([
    fetchVotingEventResults(eventId),
    fetchContestantsForEvent(eventId),
  ])
  const byId = new Map(contestants.map((c) => [c.id, [c.firstName, c.lastName].filter(Boolean).join(" ")]))
  return rows
    .map((r) => ({ islanderId: r.islanderId, name: byId.get(r.islanderId) ?? "Unknown", count: r.count }))
    .sort((a, b) => b.count - a.count)
}

export interface ApplicationResponseItem {
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
  funFacts?: Array<{ icon: string; label: string; value: string }> | null
  socialLinks?: Array<{ platform: string; handle: string; url: string }> | null
  status: string
  createdAt: string
  updatedAt: string
  media?: Array<{
    id: string
    type: string
    storageKey: string
    sortOrder: number
    createdAt: string
    updatedAt: string
  }>
}

export interface ListApplicationsResponse {
  data: ApplicationResponseItem[]
  total: number
  page: number
  limit: number
}

export interface ListApplicationsQuery {
  page?: number
  limit?: number
  status?: "submitted" | "under_review" | "accepted" | "rejected"
}

export type ApplicationResponse = ApplicationResponseItem

/**
 * Fetch applications list from API
 */
export async function fetchApplications(
  query?: ListApplicationsQuery
): Promise<ListApplicationsResponse> {
  const base = getApiBaseUrl()
  const params = new URLSearchParams()

  if (query?.page) {
    params.append("page", String(query.page))
  }
  if (query?.limit) {
    params.append("limit", String(query.limit))
  }
  if (query?.status) {
    params.append("status", query.status)
  }

  const url = `${base}/api/applications${params.toString() ? `?${params.toString()}` : ""}`

  try {
    const res = await fetch(url, {
      headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
      next: { revalidate: 0 }, // Always fetch fresh data for admin
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch applications: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    console.error("[fetchApplications] Error:", error)
    throw error
  }
}

/**
 * Fetch a single application by ID from API
 */
export async function fetchApplicationById(id: string): Promise<ApplicationResponse> {
  const base = getApiBaseUrl()
  const url = `${base}/api/applications/${id}`

  try {
    const res = await fetch(url, {
      headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
      next: { revalidate: 0 }, // Always fetch fresh data for admin
    })

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Application with id ${id} not found`)
      }
      throw new Error(`Failed to fetch application: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    console.error("[fetchApplicationById] Error:", error)
    throw error
  }
}

/**
 * Update application status.
 * Calls the Next.js proxy route so the admin key stays server-side.
 */
export async function updateApplicationStatus(
  id: string,
  status: "submitted" | "under_review" | "accepted" | "rejected"
): Promise<void> {
  const url = `/api/admin/applications/${id}/status`

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const text = await res.text()
    let message: string
    try {
      const json = JSON.parse(text) as { message?: string | string[] }
      message = Array.isArray(json.message) ? json.message.join(", ") : json.message ?? text
    } catch {
      message = text || res.statusText || "Failed to update application status"
    }
    throw new Error(message)
  }
}
