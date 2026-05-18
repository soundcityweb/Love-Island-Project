import { NextResponse } from "next/server"
import { backendPodcastsPath, readUpstreamJson, errorFromUpstream, unreachableService } from "../utils"

/** GET /api/podcasts/[slug] — single published episode */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug?.trim()) {
    return NextResponse.json({ message: "Slug is required." }, { status: 400 })
  }

  const encoded = encodeURIComponent(slug)
  try {
    const res = await fetch(backendPodcastsPath(encoded), { cache: "no-store" })
    const data = await readUpstreamJson(res)
    if (!res.ok) return errorFromUpstream(data, res.status)
    return NextResponse.json(data)
  } catch {
    return unreachableService()
  }
}
