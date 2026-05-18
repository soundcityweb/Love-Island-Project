import type { Metadata } from "next"
import Link from "next/link"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { UploadGallery } from "@/components/admin/UploadGallery"
import { CompetitionPicker } from "@/components/admin/CompetitionPicker"
interface CompetitionOption { id: string; title: string; type: string }

export const metadata: Metadata = {
  title: "Upload Gallery — Love Island Nigeria Admin",
}

const API_BASE  = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

async function fetchUploadCompetitions(): Promise<CompetitionOption[]> {
  if (!ADMIN_KEY) return []
  try {
    const res = await fetch(`${API_BASE}/api/admin/competitions`, {
      headers: { "X-Admin-Key": ADMIN_KEY },
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return (data as any[])
      .filter((c) => c.type === "upload")
      .map((c): CompetitionOption => ({ id: c.id, title: c.title, type: c.type }))
  } catch {
    return []
  }
}

export default async function AdminUploadGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string; status?: string }>
}) {
  const { competition: competitionId, status } = await searchParams
  const competitions = await fetchUploadCompetitions()
  const activeId = competitionId ?? competitions[0]?.id

  return (
    <AdminPageWrapper
      title="Upload Gallery"
      description="Review, approve, and manage upload challenge submissions."
      breadcrumb={[
        { label: "Admin",        href: "/admin"              },
        { label: "Competitions", href: "/admin/competitions" },
        { label: "Gallery"                                   },
      ]}
      actions={competitions.length > 1 ? (
        <CompetitionPicker
          competitions={competitions}
          activeId={activeId}
          label="Challenge"
          inputId="gallery-picker"
        />
      ) : undefined}
      noPadding
    >
      {activeId ? (
        <UploadGallery
          competitionId={activeId}
          initialStatus={status}
          title={competitions.find((c) => c.id === activeId)?.title}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <UploadIcon className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No upload challenges found.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create an upload-type competition to see entries here.
          </p>
        </div>
      )}
    </AdminPageWrapper>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}
