import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { CompetitionsTable, type Competition, type CompetitionQuestion } from "@/components/admin/competitions-table"

export const metadata: Metadata = {
  title: "Competition Management — Love Island Nigeria Admin",
}

// ----- Data fetching ----- //

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchCompetitions(): Promise<Competition[]> {
  if (!ADMIN_KEY) return []

  try {
    const res = await fetch(`${API_BASE}/api/admin/competitions`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return []

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map(
      (c): Competition => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        type: c.type,
        description: c.description ?? null,
        bannerUrl: c.bannerUrl ?? c.banner_url ?? null,
        sponsorName: c.sponsorName ?? c.sponsor_name ?? null,
        sponsorLogo: c.sponsorLogo ?? c.sponsor_logo ?? null,
        rewardConfig: c.rewardConfig ?? c.reward_config ?? null,
        startAt: c.startAt ?? c.start_at ?? null,
        endAt: c.endAt ?? c.end_at ?? null,
        status: c.status,
        participantCount: c.participantCount ?? c.participant_count ?? 0,
        questions: Array.isArray(c.questions)
          ? c.questions.map((q: CompetitionQuestion) => ({
              id: q.id,
              question: q.question,
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.correctAnswer ?? "",
            }))
          : [],
      }),
    )
  } catch {
    return []
  }
}

// ----- Page ----- //

export default async function AdminCompetitionsPage() {
  const competitions = await fetchCompetitions()

  return (
    <AdminPageWrapper
      title="Competition Management"
      description="Create and manage quizzes, polls, predictions, and upload challenges for Love Island Nigeria."
      breadcrumb={[
        { label: "Admin",        href: "/admin"               },
        { label: "Competitions"                               },
      ]}
      noPadding
    >
      <CompetitionsTable initialCompetitions={competitions} />
    </AdminPageWrapper>
  )
}
