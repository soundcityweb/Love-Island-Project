import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import {
  QuizSubmissionsTable,
  type QuizSubmission,
  type QuizStats,
  type LeaderboardEntry,
} from "@/components/admin/quiz-submissions-table"
interface CompetitionOption { id: string; title: string; type: string }

export const metadata: Metadata = {
  title: "Quiz Submissions — Love Island Nigeria Admin",
}

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

// ----- Data fetching ----- //

async function fetchQuizSubmissions(competitionId?: string): Promise<{
  submissions: QuizSubmission[]
  stats: QuizStats
  leaderboard: LeaderboardEntry[]
}> {
  if (!ADMIN_KEY) return { submissions: [], stats: { totalSubmissions: 0, avgScore: 0, topScore: 0, totalQuestions: 0, passThreshold: 1 }, leaderboard: [] }

  const qs = new URLSearchParams({ limit: "100" })
  if (competitionId) qs.set("competitionId", competitionId)

  try {
    const res = await fetch(`${API_BASE}/api/admin/competitions/quiz-submissions?${qs}`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return { submissions: [], stats: { totalSubmissions: 0, avgScore: 0, topScore: 0, totalQuestions: 0, passThreshold: 1 }, leaderboard: [] }

    const body = await res.json()

    const submissions: QuizSubmission[] = (body.data ?? []).map((s: any): QuizSubmission => ({
      id:            s.id,
      userId:        s.userId,
      competitionId: s.competitionId,
      competition:   s.competition ?? null,
      score:         s.score ?? 0,
      total:         s.total ?? 0,
      answers:       s.answers ?? {},
      status:        s.status ?? "active",
      createdAt:     s.createdAt,
      rank:          s.rank ?? 0,
      questions:     (s.questions ?? []).map((q: any) => ({
        id:            q.id,
        question:      q.question,
        options:       q.options ?? [],
        correctAnswer: q.correctAnswer ?? "",
        userAnswer:    q.userAnswer ?? null,
        correct:       Boolean(q.correct),
      })),
    }))

    return {
      submissions,
      stats:       body.stats       ?? { totalSubmissions: 0, avgScore: 0, topScore: 0, totalQuestions: 0, passThreshold: 1 },
      leaderboard: body.leaderboard ?? [],
    }
  } catch {
    return { submissions: [], stats: { totalSubmissions: 0, avgScore: 0, topScore: 0, totalQuestions: 0, passThreshold: 1 }, leaderboard: [] }
  }
}

async function fetchQuizCompetitions(): Promise<CompetitionOption[]> {
  if (!ADMIN_KEY) return []
  try {
    const res = await fetch(`${API_BASE}/api/admin/competitions`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return (data as any[])
      .filter((c) => c.type === "quiz")
      .map((c): CompetitionOption => ({ id: c.id, title: c.title, type: c.type }))
  } catch {
    return []
  }
}

// ----- Page ----- //

export default async function AdminQuizSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>
}) {
  const { competition: competitionId } = await searchParams

  const [{ submissions, stats, leaderboard }, competitions] = await Promise.all([
    fetchQuizSubmissions(competitionId),
    fetchQuizCompetitions(),
  ])

  return (
    <AdminPageWrapper
      title="Quiz Submissions"
      description="Review per-question breakdowns, scores, and the leaderboard for all quiz competitions."
      breadcrumb={[
        { label: "Admin",        href: "/admin"              },
        { label: "Competitions", href: "/admin/competitions" },
        { label: "Quiz"                                      },
      ]}
      noPadding
    >
      <QuizSubmissionsTable
        initialSubmissions={submissions}
        initialStats={stats}
        initialLeaderboard={leaderboard}
        competitions={competitions}
        defaultCompetitionId={competitionId}
      />
    </AdminPageWrapper>
  )
}
