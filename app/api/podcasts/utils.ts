import { NextResponse } from "next/server"

/** Nest API origin; prefer NEXT_PUBLIC_API_URL as requested. */
export const API_BASE =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export function backendPodcastsPath(suffix = ""): string {
  const base = API_BASE.replace(/\/$/, "")
  const path = suffix.replace(/^\//, "")
  return path ? `${base}/api/podcasts/${path}` : `${base}/api/podcasts`
}

export async function readUpstreamJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: "Invalid response from podcast service." }
  }
}

export function errorFromUpstream(data: unknown, status: number): NextResponse {
  const message =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
      ? (data as { message: string }).message
      : "Request failed."
  return NextResponse.json({ message }, { status })
}

export function unreachableService(): NextResponse {
  return NextResponse.json({ message: "Could not reach the podcast service." }, { status: 503 })
}
