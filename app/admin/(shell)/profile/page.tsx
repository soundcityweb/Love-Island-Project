"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { AdminProfileSettings } from "@/components/admin/profile-settings"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

function ProfileTabBridge() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "security" ? "security" : "profile"
  return <AdminProfileSettings defaultTab={defaultTab} />
}

function ProfileSuspenseFallback() {
  return (
    <AdminPageWrapper
      title="Profile & Security"
      description="Loading your account…"
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Profile" },
      ]}
      contentClassName="p-6"
    >
      <div className="h-32 animate-pulse rounded-lg bg-muted/60" aria-hidden />
    </AdminPageWrapper>
  )
}

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<ProfileSuspenseFallback />}>
      <ProfileTabBridge />
    </Suspense>
  )
}
