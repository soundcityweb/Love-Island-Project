"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Application, ApplicationStatus } from "@/app/types/application"

interface ApplicationStatusSelectorProps {
  status: ApplicationStatus
  onStatusChange: (status: ApplicationStatus) => void
  isLoading?: boolean
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

function formatStatus(status: ApplicationStatus): string {
  switch (status) {
    case "submitted":
      return "Submitted"
    case "under_review":
      return "Under Review"
    case "accepted":
      return "Accepted"
    case "rejected":
      return "Rejected"
  }
}

export function ApplicationStatusSelector({
  status,
  onStatusChange,
  isLoading = false,
}: ApplicationStatusSelectorProps) {
  return (
    <section className="rounded-xl border border-border bg-card px-5 py-4">
      <h2 className="text-sm font-bold text-card-foreground">Application Status</h2>
      <div className="mt-3">
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(val as ApplicationStatus)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="submitted">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Submitted
              </span>
            </SelectItem>
            <SelectItem value="under_review">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Under Review
              </span>
            </SelectItem>
            <SelectItem value="accepted">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Accepted
              </span>
            </SelectItem>
            <SelectItem value="rejected">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Rejected
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      {/* Quick Actions */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-transparent text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={() => onStatusChange("accepted")}
          disabled={isLoading || status === "accepted"}
        >
          <CheckCircleIcon className="mr-1.5 h-3.5 w-3.5" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onStatusChange("rejected")}
          disabled={isLoading || status === "rejected"}
        >
          <XCircleIcon className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
        {status !== "submitted" && (
          <Button
            size="sm"
            variant="outline"
            className="col-span-2 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => onStatusChange("under_review")}
            disabled={isLoading || status === "under_review"}
          >
            <ClockIcon className="mr-1.5 h-3.5 w-3.5" />
            Mark Under Review
          </Button>
        )}
      </div>
    </section>
  )
}
