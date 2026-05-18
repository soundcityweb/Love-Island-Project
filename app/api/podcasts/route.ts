import { NextResponse, type NextRequest } from "next/server"
import { backendPodcastsPath, readUpstreamJson, errorFromUpstream, unreachableService } from "./utils"

const ADMIN_KEY = process.env.ADMIN_API_KEY

function missingAdminConfig(): NextResponse {
  return NextResponse.json({ message: "Admin API is not configured." }, { status: 500 })
}

/** GET /api/podcasts — published episodes (proxies Nest GET /api/podcasts) */
export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(backendPodcastsPath(""), { cache: "no-store" })
    const data = await readUpstreamJson(res)
    if (!res.ok) return errorFromUpstream(data, res.status)
    return NextResponse.json(data)
  } catch {
    return unreachableService()
  }
}

/** POST /api/podcasts — create episode (server injects X-Admin-Key for Nest) */
export async function POST(req: Request) {
  if (!ADMIN_KEY) return missingAdminConfig()

  const body = await req.json().catch(() => null)
  if (body === null || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  try {
    const res = await fetch(backendPodcastsPath(""), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
      body: JSON.stringify(body),
    })
    const data = await readUpstreamJson(res)
    if (!res.ok) return errorFromUpstream(data, res.status)
    return NextResponse.json(data, { status: res.status === 201 ? 201 : 200 })
  } catch {
    return unreachableService()
  }
}
