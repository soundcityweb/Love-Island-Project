import type { Metadata } from "next"
import { VotingEventsWrapper } from "./voting-events-wrapper"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

export const metadata: Metadata = {
  title: "Voting Events - Admin | Love Island Nigeria",
  description: "Manage and monitor voting events for Love Island Nigeria.",
}

export default function AdminVotingPage() {
  return (
    <AdminPageWrapper
      eyebrow="Season 1"
      title="Voting Events"
      description="Create, manage, and monitor all voting events for Love Island Nigeria Season 1."
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Voting" },
      ]}
      noPadding
    >
      <VotingEventsWrapper />
    </AdminPageWrapper>
  )
}
