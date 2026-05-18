"use client"

import { useCallback } from "react"
import { ApplicationReview } from "./application-review"
import { updateApplicationStatus } from "@/app/lib/api-admin"
import type { Application } from "@/app/types/application"

interface ApplicationReviewWrapperProps {
  application: Application
}

export function ApplicationReviewWrapper({
  application,
}: ApplicationReviewWrapperProps) {
  const handleStatusChange = useCallback(
    async (id: string, status: Application["status"]) => {
      try {
        await updateApplicationStatus(id, status)
        // Status update successful - component will handle optimistic update
      } catch (error) {
        console.error("Failed to update application status:", error)
        throw error // Re-throw to let component handle error state and rollback
      }
    },
    []
  )

  return (
    <ApplicationReview
      application={application}
      onStatusChange={handleStatusChange}
      isLoading={false}
    />
  )
}
