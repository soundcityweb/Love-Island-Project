import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CompetitionDetail, type CompetitionData } from "@/components/competitions/competition-detail"

// ── API helper ────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function fetchCompetition(slug: string): Promise<CompetitionData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/competitions/${slug}`, {
      cache: "no-store",
    })
    if (!res.ok) return null

    const c = await res.json()
    if (!c || !c.id) return null

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      type: c.type,
      description: c.description ?? null,
      bannerUrl: c.bannerUrl ?? c.banner_url ?? null,
      sponsorName: c.sponsorName ?? c.sponsor_name ?? null,
      sponsorLogo: c.sponsorLogo ?? c.sponsor_logo ?? null,
      startAt: c.startAt ?? c.start_at ?? null,
      endAt: c.endAt ?? c.end_at ?? null,
      status: c.status,
      rewardConfig: c.rewardConfig ?? c.reward_config ?? null,
    }
  } catch {
    return null
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const competition = await fetchCompetition(slug)

  if (!competition) {
    return {
      title: "Competition Not Found | Love Island Nigeria",
    }
  }

  const typeLabel: Record<string, string> = {
    quiz: "Quiz",
    poll: "Fan Poll",
    prediction: "Prediction",
    upload: "Upload Challenge",
  }

  const typeName = typeLabel[competition.type] ?? "Challenge"
  const title = `${competition.title} — ${typeName} | Love Island Nigeria`
  const description =
    competition.description ??
    `Play the ${competition.title} ${typeName.toLowerCase()} on Love Island Nigeria. Answer questions, win prizes, and show off your villa knowledge.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(competition.bannerUrl ? { images: [{ url: competition.bannerUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(competition.bannerUrl ? { images: [competition.bannerUrl] } : {}),
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompetitionDetailPage({ params }: PageProps) {
  const { slug } = await params
  const competition = await fetchCompetition(slug)

  if (!competition) notFound()

  // Don't expose draft pages publicly
  if (competition.status === "draft") notFound()

  return (
    <main className="min-h-screen bg-foreground">
      <CompetitionDetail competition={competition} />
    </main>
  )
}
