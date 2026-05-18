"use client"

import Link from "next/link"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Application } from "@/app/types/application"

interface ApplicationTableRowProps {
  application: Application
  onStatusChange: (id: string, status: Application["status"]) => void
}

function statusBadgeClasses(status: Application["status"]) {
  switch (status) {
    case "submitted":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700"
  }
}

function formatStatus(status: Application["status"]): string {
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

function EllipsisIcon({ className }: { className?: string }) {
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
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  )
}

export function ApplicationTableRow({
  application,
  onStatusChange,
}: ApplicationTableRowProps) {
  const fullName = `${application.firstName} ${application.lastName}`
  const imageCount = application.media?.filter((m) => m.type === "image").length ?? 0
  const hasVideo = application.media?.some((m) => m.type === "video") ?? false

  return (
    <TableRow>
      {/* ID */}
      <TableCell className="font-mono text-xs text-muted-foreground">
        {application.id.slice(0, 8)}...
      </TableCell>

      {/* Name + email */}
      <TableCell>
        <div>
          <p className="font-medium text-card-foreground">{fullName}</p>
          <p className="text-xs text-muted-foreground">{application.email}</p>
        </div>
      </TableCell>

      {/* City */}
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
        {application.city}
      </TableCell>

      {/* Date */}
      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
        {new Date(application.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </TableCell>

      {/* Media */}
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            {imageCount}
          </span>
          {hasVideo && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              1
            </span>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className={statusBadgeClasses(application.status)}>
          {formatStatus(application.status)}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            asChild
          >
            <Link href={`/admin/applications/${application.id}`}>View</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Actions for ${fullName}`}
              >
                <EllipsisIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusChange(application.id, "accepted")}
                className="text-emerald-600 focus:text-emerald-600"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Accept
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(application.id, "rejected")}
                className="text-red-600 focus:text-red-600"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(application.id, "under_review")}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h69.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
                Mark Under Review
              </DropdownMenuItem>
              {application.status !== "submitted" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(application.id, "submitted")}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Reset to Submitted
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
