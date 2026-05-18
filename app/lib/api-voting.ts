/**
 * Client-side API for voting: current event, contestants, submit vote.
 * Uses NEXT_PUBLIC_API_URL. No vote totals or aggregation.
 */

const getBaseUrl = (): string =>
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "http://localhost:3000"

export interface VotingEvent {
  id: string
  code: string
  name: string
  status: "draft" | "open" | "closed"
  startsAt: string
  endsAt: string
  resultsPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ContestantDto {
  id: string
  firstName: string
  lastName: string | null
  age: number
  location: string
  profileImage: string | null
}

export interface VoteSuccessResponse {
  success: true
  voteId: string
}

export interface DraftPreviewResponse {
  event: VotingEvent
  contestants: ContestantDto[]
}

/** GET /api/voting-events/:id/preview?token=… — draft event + contestants (signed token from admin only). */
export async function fetchDraftPreview(
  eventId: string,
  token: string,
): Promise<DraftPreviewResponse> {
  const base = getBaseUrl()
  const q = new URLSearchParams({ token })
  const res = await fetch(`${base}/api/voting-events/${eventId}/preview?${q.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    let message = "Unable to load preview."
    try {
      const json = (await res.json()) as { message?: string | string[] }
      message = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message ?? message
    } catch {
      // keep generic
    }
    throw new Error(message)
  }
  const data = (await res.json()) as DraftPreviewResponse
  return data
}

/** GET /api/votes/periods/current — active period + server time for countdown sync */
export interface CurrentVotingPayload {
  period: VotingEvent | null
  serverNow: string
}

export interface CurrentVotingEventResult extends CurrentVotingPayload {
  /** server time minus client midpoint at response (ms); use Date.now() + offsetMs as synced "now" */
  offsetMs: number
}

export async function fetchCurrentVotingEvent(): Promise<CurrentVotingEventResult> {
  const base = getBaseUrl()
  const wall0 = Date.now()
  const res = await fetch(`${base}/api/votes/periods/current`, { cache: "no-store" })
  const wall1 = Date.now()
  if (!res.ok) {
    if (res.status === 404) {
      return {
        period: null,
        serverNow: new Date(wall1).toISOString(),
        offsetMs: 0,
      }
    }
    throw new Error("Failed to load voting event")
  }
  const raw = (await res.json()) as unknown
  const clientMid = (wall0 + wall1) / 2

  if (
    raw &&
    typeof raw === "object" &&
    "id" in raw &&
    !("period" in raw)
  ) {
    const period = raw as VotingEvent
    return {
      period,
      serverNow: new Date(wall1).toISOString(),
      offsetMs: 0,
    }
  }

  const data = raw as CurrentVotingPayload
  const serverNow =
    typeof data?.serverNow === "string"
      ? data.serverNow
      : new Date(wall1).toISOString()
  const offsetMs = new Date(serverNow).getTime() - clientMid
  return {
    period: data?.period ?? null,
    serverNow,
    offsetMs,
  }
}

/** GET /api/voting-events/:id/contestants — contestants for an event (no vote totals) */
export async function fetchContestants(eventId: string): Promise<ContestantDto[]> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/voting-events/${eventId}/contestants`)
  if (!res.ok) {
    if (res.status === 404) return []
    throw new Error("Failed to load contestants")
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** POST /api/vote — submit vote. Requires X-Session-Id header. */
export async function submitVote(islanderId: string, sessionId: string): Promise<VoteSuccessResponse> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
    body: JSON.stringify({ islanderId }),
  })
  const text = await res.text()
  if (!res.ok) {
    if (res.status === 409) {
      throw new Error("You have already voted.")
    }
    let message = "Unable to process request."
    try {
      const json = JSON.parse(text) as { message?: string | string[] }
      message = Array.isArray(json.message) ? json.message.join(", ") : json.message ?? message
    } catch {
      // use generic
    }
    throw new Error(message)
  }
  return JSON.parse(text) as VoteSuccessResponse
}

/** Convert a storage key (Cloudinary public_id) to a renderable image URL. */
export function getUploadsUrl(storageKey: string | null | undefined): string {
  if (!storageKey?.trim()) return ""
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) return storageKey
  if (storageKey.startsWith("/uploads/") || storageKey.startsWith("uploads/")) {
    const key = storageKey.startsWith("/") ? storageKey.slice(1) : storageKey
    return `/api/uploads/${key}`
  }
  const cloud =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) || ""
  return `https://res.cloudinary.com/${cloud}/image/upload/${storageKey}`
}

const FALLBACK_IMAGE = "/placeholder.svg"

/** Map API contestant to UI Contestant (id, name, age, location, image). */
export function mapContestantToUI(dto: ContestantDto): {
  id: string
  name: string
  age: number
  location: string
  image: string
} {
  const name = [dto.firstName, dto.lastName].filter(Boolean).join(" ")
  return {
    id: dto.id,
    name,
    age: dto.age,
    location: dto.location,
    image: getUploadsUrl(dto.profileImage) || FALLBACK_IMAGE,
  }
}
