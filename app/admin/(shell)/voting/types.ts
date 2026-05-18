/** Voting event (aligns with backend voting period). */
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
  /** Optional; from backend when available */
  contestantCount?: number
  /** Optional; from backend when available */
  totalVotes?: number
}
