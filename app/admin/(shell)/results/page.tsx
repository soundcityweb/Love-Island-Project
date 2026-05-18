import type { Metadata } from "next"
import { fetchVotingPeriods } from "@/app/lib/api-admin"
import { AdminResultsView } from "@/components/admin/admin-results-view"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

export const metadata: Metadata = {
  title: "Voting Results - Admin | Love Island Nigeria",
  description: "View aggregated vote counts per contestant. Read-only.",
}

export default async function AdminResultsPage() {
  let periods: Awaited<ReturnType<typeof fetchVotingPeriods>> = []
  try {
    periods = await fetchVotingPeriods()
  } catch (e) {
    console.error("Failed to fetch voting periods:", e)
  }

  return (
    <AdminPageWrapper
      title="Voting Results"
      description="Aggregated vote counts per contestant. Data refreshes every 10 seconds. Results cannot be edited."
      breadcrumb={[
        { label: "Admin",   href: "/admin"   },
        { label: "Results"                   },
      ]}
      noPadding
    >
      <AdminResultsView periods={periods} />
    </AdminPageWrapper>
  )
}
