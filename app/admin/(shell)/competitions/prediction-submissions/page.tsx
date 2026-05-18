import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import {
  PredictionSubmissionsTable,
  type PredictionSubmission,
  type PredictionQuestionDto,
  type PredictionStats,
} from "@/components/admin/prediction-submissions-table"
import type { CompetitionOption } from "@/types/admin-competition"

export const metadata: Metadata = {
  title: "Prediction Submissions — Love Island Nigeria Admin",
}

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

// ----- Data fetching ----- //

async function fetchPredictionSubmissions(competitionId?: string): Promise<{
  submissions: PredictionSubmission[]
  stats: PredictionStats
  questions: PredictionQuestionDto[]
}> {
  const empty = {
    submissions: [],
    stats: { totalSubmissions: 0, uniqueParticipants: 0, correctPredictions: 0, accuracy: null, resultDeclared: false },
    questions:   [],
  }
  if (!ADMIN_KEY) return empty

  const qs = new URLSearchParams({ limit: "200" })
  if (competitionId) qs.set("competitionId", competitionId)

  try {
    const res = await fetch(`${API_BASE}/api/admin/competitions/prediction-submissions?${qs}`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return empty

    const body = await res.json()

    const submissions: PredictionSubmission[] = (body.data ?? []).map((s: any): PredictionSubmission => ({
      id:              s.id,
      userId:          s.userId,
      competitionId:   s.competitionId,
      competition:     s.competition ?? null,
      selectedOption:  s.selectedOption ?? null,
      correctAnswer:   s.correctAnswer ?? null,
      isCorrect:       s.isCorrect ?? null,
      resultDeclared:  Boolean(s.resultDeclared),
      allCorrect:      Boolean(s.allCorrect),
      anyWrong:        Boolean(s.anyWrong),
      questionResults: (s.questionResults ?? []).map((r: any) => ({
        questionId:     r.questionId,
        question:       r.question,
        userAnswer:     r.userAnswer ?? null,
        correctAnswer:  r.correctAnswer ?? null,
        isCorrect:      r.isCorrect ?? null,
        resultDeclared: Boolean(r.resultDeclared),
      })),
      status:    s.status ?? "active",
      createdAt: s.createdAt,
    }))

    const questions: PredictionQuestionDto[] = (body.questions ?? []).map((q: any): PredictionQuestionDto => ({
      id:             q.id,
      competitionId:  q.competitionId,
      question:       q.question,
      correctAnswer:  q.correctAnswer ?? null,
      resultDeclared: Boolean(q.resultDeclared),
      totalVotes:     q.totalVotes ?? 0,
      options: (q.options ?? []).map((o: any) => ({
        option:    o.option,
        count:     o.count ?? 0,
        pct:       o.pct ?? 0,
        isCorrect: o.isCorrect ?? null,
      })),
    }))

    return {
      submissions,
      stats:     body.stats     ?? empty.stats,
      questions,
    }
  } catch {
    return empty
  }
}

async function fetchPredictionCompetitions(): Promise<CompetitionOption[]> {
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
      .filter((c) => c.type === "prediction")
      .map((c): CompetitionOption => ({ id: c.id, title: c.title, type: c.type }))
  } catch {
    return []
  }
}

// ----- Page ----- //

export default async function AdminPredictionSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>
}) {
  const { competition: competitionId } = await searchParams

  const [{ submissions, stats, questions }, competitions] = await Promise.all([
    fetchPredictionSubmissions(competitionId),
    fetchPredictionCompetitions(),
  ])

  return (
    <AdminPageWrapper
      title="Prediction Submissions"
      description="Analyse option distributions, accuracy rates, and highlight correct predictions after results are declared."
      breadcrumb={[
        { label: "Admin",        href: "/admin"              },
        { label: "Competitions", href: "/admin/competitions" },
        { label: "Predictions"                               },
      ]}
      noPadding
    >
      <PredictionSubmissionsTable
        initialSubmissions={submissions}
        initialStats={stats}
        initialQuestions={questions}
        competitions={competitions}
        defaultCompetitionId={competitionId}
      />
    </AdminPageWrapper>
  )
}
