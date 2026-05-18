import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ApplicationReviewWrapper } from "@/components/admin/application-review-wrapper"
import { fetchApplicationById } from "@/app/lib/api-admin"
import { mapApplicationResponse } from "@/app/lib/mappers-admin"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Review Application - Admin | Love Island Nigeria",
  description:
    "Detailed review of a contestant application for Love Island Nigeria. View media, manage status, and add internal notes.",
}

export default async function AdminApplicationReviewPage({ params }: PageProps) {
  const { id } = await params

  try {
    const apiResponse = await fetchApplicationById(id)
    const application = mapApplicationResponse(apiResponse)

    return <ApplicationReviewWrapper application={application} />
  } catch (error) {
    console.error("Failed to fetch application:", error)
    // If application not found, show 404 page
    if (error instanceof Error && error.message.includes("not found")) {
      notFound()
    }
    // For other errors, re-throw to show error boundary
    throw error
  }
}
