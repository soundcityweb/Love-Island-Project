import type { Metadata } from "next"
import { ApplicationsTable } from "@/components/admin/applications-table"
import { fetchApplications } from "@/app/lib/api-admin"
import { mapApplicationsResponse } from "@/app/lib/mappers-admin"
import type { Application } from "@/app/types/application"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

export const metadata: Metadata = {
  title: "Applications Review - Admin | Love Island Nigeria",
  description: "Review and manage contestant applications for Love Island Nigeria.",
}

export default async function AdminApplicationsPage() {
  let applications: Application[] = []
  let isLoading = false

  try {
    const response = await fetchApplications({ limit: 100 })
    applications = mapApplicationsResponse(response)
  } catch (error) {
    console.error("Failed to fetch applications:", error)
  }

  return (
    <AdminPageWrapper
      eyebrow="Season 1"
      title="Contestant Applications"
      description="Review, screen, and manage all incoming applications for Love Island Nigeria Season 1."
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Applications" },
      ]}
      noPadding
    >
      <ApplicationsTable applications={applications} isLoading={isLoading} />
    </AdminPageWrapper>
  )
}
