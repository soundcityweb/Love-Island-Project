"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  city: string
  occupation: string
  bio: string
  submittedAt: string
  status: "Pending" | "Approved" | "Rejected"
  photoCount: number
  hasVideo: boolean
}

interface ApplicantDetailDialogProps {
  applicant: Applicant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: Applicant["status"]) => void
}

function statusBadgeClasses(status: Applicant["status"]) {
  switch (status) {
    case "Pending":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "Approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700"
  }
}

export function ApplicantDetailDialog({
  applicant,
  open,
  onOpenChange,
  onStatusChange,
}: ApplicantDetailDialogProps) {
  if (!applicant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{applicant.name}</DialogTitle>
            <Badge
              variant="outline"
              className={statusBadgeClasses(applicant.status)}
            >
              {applicant.status}
            </Badge>
          </div>
          <DialogDescription>
            Applied on{" "}
            {new Date(applicant.submittedAt).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        {/* Personal Details */}
        <div className="space-y-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Personal Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Email" value={applicant.email} />
            <DetailItem label="Phone" value={applicant.phone} />
            <DetailItem label="Age" value={String(applicant.age)} />
            <DetailItem label="Gender" value={applicant.gender} />
            <DetailItem label="City" value={applicant.city} />
            <DetailItem label="Occupation" value={applicant.occupation} />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Bio
          </h4>
          <p className="text-sm leading-relaxed text-foreground">
            {applicant.bio}
          </p>
        </div>

        {/* Media */}
        <div className="space-y-2">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Media Uploads
          </h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
              <svg
                className="h-4 w-4 text-muted-foreground"
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
              <span className="text-foreground">
                {applicant.photoCount} photo{applicant.photoCount !== 1 && "s"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
              <svg
                className="h-4 w-4 text-muted-foreground"
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
              <span className="text-foreground">
                {applicant.hasVideo ? "Video uploaded" : "No video"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <span className="text-sm font-medium text-muted-foreground">
            Set status:
          </span>
          <Button
            size="sm"
            variant={applicant.status === "Approved" ? "default" : "outline"}
            className={
              applicant.status === "Approved"
                ? "bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
                : ""
            }
            onClick={() => onStatusChange(applicant.id, "Approved")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant={applicant.status === "Rejected" ? "default" : "outline"}
            className={
              applicant.status === "Rejected"
                ? "bg-red-600 text-primary-foreground hover:bg-red-700"
                : ""
            }
            onClick={() => onStatusChange(applicant.id, "Rejected")}
          >
            Reject
          </Button>
          {applicant.status !== "Pending" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(applicant.id, "Pending")}
            >
              Reset to Pending
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
