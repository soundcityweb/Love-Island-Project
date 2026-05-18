"use server"

import {
  fetchVotingAnalytics,
  type AdminVotingAnalytics,
} from "@/app/lib/api-admin"

/** Server action: load analytics (for RSC or server callers). Client UI uses the Next proxy route. */
export async function getVotingAnalytics(
  eventId: string,
): Promise<AdminVotingAnalytics> {
  return fetchVotingAnalytics(eventId)
}
