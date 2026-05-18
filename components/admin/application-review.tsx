"use client"

import React, { useState, useCallback } from "react"
import { Heart, Music, Utensils, Sparkles, Sun, Flame, ArrowLeft, CheckCircle2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApplicationMediaPreview } from "./application-media-preview"
import { ApplicationStatusSelector } from "./application-status-selector"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import type { Application } from "@/app/types/application"

const FUN_FACT_ICON_MAP: Record<string, React.ReactNode> = {
  heart: <Heart className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  sparkle: <Sparkles className="h-4 w-4" />,
  sun: <Sun className="h-4 w-4" />,
  flame: <Flame className="h-4 w-4" />,
}

interface ApplicationReviewProps {
  application: Application
  onStatusChange?: (id: string, status: Application["status"]) => Promise<void>
  isLoading?: boolean
}

// ----- Icons ----- //


function UserIcon({ className }: { className?: string }) {
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
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
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
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
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
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
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
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
      />
    </svg>
  )
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

// ----- Helpers ----- //

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

function statusDotClass(status: Application["status"]) {
  switch (status) {
    case "submitted":
      return "bg-amber-500"
    case "under_review":
      return "bg-blue-500"
    case "accepted":
      return "bg-emerald-500"
    case "rejected":
      return "bg-red-500"
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

// ----- Component ----- //

export function ApplicationReview({
  application,
  onStatusChange,
  isLoading = false,
}: ApplicationReviewProps) {
  const [localStatus, setLocalStatus] = useState<Application["status"]>(application.status)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fullName = `${application.firstName} ${application.lastName}`

  const handleStatusChange = useCallback(
    async (newStatus: Application["status"]) => {
      const previousStatus = localStatus

      // Optimistic update: update UI immediately
      setLocalStatus(newStatus)

      if (onStatusChange) {
        setIsSaving(true)
        try {
          await onStatusChange(application.id, newStatus)
          // Success - UI already updated optimistically
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        } catch (error) {
          console.error("Failed to update status:", error)
          // Rollback: revert to previous status
          setLocalStatus(previousStatus)
          // TODO: Show error toast/notification
        } finally {
          setIsSaving(false)
        }
      }
    },
    [application.id, localStatus, onStatusChange]
  )

  const handleSave = useCallback(async () => {
    if (onStatusChange && localStatus !== application.status) {
      const previousStatus = application.status

      setIsSaving(true)
      try {
        await onStatusChange(application.id, localStatus)
        // Success - UI already shows localStatus
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } catch (error) {
        console.error("Failed to save:", error)
        // Rollback: revert to previous status
        setLocalStatus(previousStatus)
        // TODO: Show error toast/notification
      } finally {
        setIsSaving(false)
      }
    }
  }, [application.id, application.status, localStatus, onStatusChange])

  const submittedDate = new Date(application.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <AdminPageWrapper
      eyebrow="Application Review"
      title={fullName}
      description={`Submitted ${submittedDate} · ID: ${application.id.slice(0, 8)}…`}
      breadcrumb={[
        { label: "Admin",        href: "/admin"               },
        { label: "Applications", href: "/admin/applications"  },
        { label: application.id.slice(0, 8) + "…"            },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <Badge variant="outline" className={statusBadgeClasses(localStatus)}>
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusDotClass(localStatus)}`} />
            {formatStatus(localStatus)}
          </Badge>

          {/* Save — only when status has changed */}
          {localStatus !== application.status && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Review
                </>
              )}
            </Button>
          )}
        </div>
      }
      noPadding
    >
      {/* Main layout: media-first left column, sidebar right */}
      <div className="flex flex-col gap-8 p-0 lg:flex-row">
          {/* LEFT: Media Review */}
          <div className="flex-1 space-y-6">
            <ApplicationMediaPreview application={application} />

            {/* Tagline & status label */}
            {(application.tagline || application.profileStatusLabel) && (
              <section className="rounded-xl border border-border bg-card px-5 py-4">
                <h2 className="text-sm font-bold text-card-foreground">Tagline & Profile Status</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {application.tagline && (
                    <p className="leading-relaxed text-foreground">
                      <span className="font-medium text-muted-foreground">Tagline:</span>{" "}
                      {application.tagline}
                    </p>
                  )}
                  {application.profileStatusLabel && (
                    <p className="leading-relaxed text-foreground">
                      <span className="font-medium text-muted-foreground">Profile status:</span>{" "}
                      {application.profileStatusLabel}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Bio */}
            <section className="rounded-xl border border-border bg-card px-5 py-4">
              <h2 className="text-sm font-bold text-card-foreground">Bio / About</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{application.bio}</p>
              {application.lookingFor && (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Looking for
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {application.lookingFor}
                  </p>
                </div>
              )}
            </section>

            {/* Fun facts */}
            {application.funFacts && application.funFacts.length > 0 && (
              <section className="rounded-xl border border-border bg-card px-5 py-4">
                <h2 className="text-sm font-bold text-card-foreground">Fun Facts</h2>
                <ul className="mt-3 space-y-2">
                  {application.funFacts.map((fact, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {FUN_FACT_ICON_MAP[fact.icon] ?? <Sparkles className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-muted-foreground">{fact.label}:</span>{" "}
                        <span className="text-foreground">{fact.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Social links */}
            {application.socialLinks && application.socialLinks.length > 0 && (
              <section className="rounded-xl border border-border bg-card px-5 py-4">
                <h2 className="text-sm font-bold text-card-foreground">Social Links</h2>
                <ul className="mt-3 space-y-2">
                  {application.socialLinks.map((link, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="font-medium capitalize text-foreground">{link.platform}</span>
                      <span className="truncate text-muted-foreground">{link.handle}</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-primary hover:underline"
                      >
                        Link
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="w-full space-y-6 lg:w-80 xl:w-96">
            {/* Personal Details Card */}
            <section className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-bold text-card-foreground">Applicant Details</h2>
              </div>
              <div className="space-y-0 divide-y divide-border">
                <DetailRow
                  icon={<MailIcon className="h-4 w-4 text-muted-foreground" />}
                  label="Email"
                  value={application.email}
                />
                <DetailRow
                  icon={<PhoneIcon className="h-4 w-4 text-muted-foreground" />}
                  label="Phone"
                  value={application.phone}
                />
                <DetailRow
                  icon={<UserIcon className="h-4 w-4 text-muted-foreground" />}
                  label="Age / Gender"
                  value={`${application.age} years old, ${application.gender}`}
                />
                <DetailRow
                  icon={<MapPinIcon className="h-4 w-4 text-muted-foreground" />}
                  label="City"
                  value={application.city}
                />
                <DetailRow
                  icon={<BriefcaseIcon className="h-4 w-4 text-muted-foreground" />}
                  label="Occupation"
                  value={application.occupation}
                />
              </div>
            </section>

            {/* Status Selector Card */}
            <ApplicationStatusSelector
              status={localStatus}
              onStatusChange={handleStatusChange}
              isLoading={isLoading || isSaving}
            />

            {/* Activity Log */}
            <section className="rounded-xl border border-border bg-card px-5 py-4">
              <h2 className="text-sm font-bold text-card-foreground">Activity Log</h2>
              <div className="mt-3 space-y-3">
                {[
                  {
                    action: "Application received",
                    time: new Date(application.createdAt).toLocaleString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                    color: "bg-muted-foreground",
                  },
                  {
                    action: "Status updated",
                    time: new Date(application.updatedAt).toLocaleString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                    color: "bg-accent",
                  },
                ].map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 flex flex-col items-center">
                      <span className={`h-2 w-2 rounded-full ${event.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">{event.action}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
      </div>
    </AdminPageWrapper>
  )
}

// ----- Sub-Components ----- //

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      {icon}
      <div className="flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-card-foreground">{value}</p>
      </div>
    </div>
  )
}
