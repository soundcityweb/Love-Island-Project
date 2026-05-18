// ── Shared types for the Competitions module ──────────────────────────────────

export type CompetitionType = "quiz" | "poll" | "prediction" | "upload"
export type CompetitionStatus = "active" | "upcoming" | "completed" | "draft"

/** Used on the public listing page (no reward config needed). */
export interface Competition {
  id: string
  title: string
  slug: string
  type: CompetitionType
  description: string | null
  bannerUrl: string | null
  sponsorName: string | null
  sponsorLogo: string | null
  startAt: string | null
  endAt: string | null
  status: CompetitionStatus
  participantCount: number
}

/** Used on the detail page (richer, includes reward config). */
export interface CompetitionData extends Omit<Competition, "participantCount"> {
  rewardConfig: string | null
}

export interface Question {
  id: string
  question: string
  options: string[]
}

export interface SubmitResult {
  score: number
  total: number
  passed: boolean
  results?: Array<{
    questionId: string
    correct: boolean
    correctAnswer: string
    yourAnswer: string
  }>
}

// ── Display metadata ──────────────────────────────────────────────────────────

export const TYPE_LABEL: Record<CompetitionType, string> = {
  quiz:       "Quiz",
  poll:       "Fan Poll",
  prediction: "Prediction",
  upload:     "Upload",
}

export const TYPE_BADGE_CLASS: Record<CompetitionType, string> = {
  quiz:       "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  poll:       "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  prediction: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  upload:     "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
}

export const TYPE_BANNER_GRADIENT: Record<CompetitionType, string> = {
  quiz:       "from-[#FF7A17] via-[#FF4D80] to-[#C40610]",
  poll:       "from-[#FF36A0] via-[#A855F7] to-[#7C3AED]",
  prediction: "from-[#7C3AED] via-[#3B82F6] to-[#0EA5E9]",
  upload:     "from-[#10B981] via-[#059669] to-[#065F46]",
}
