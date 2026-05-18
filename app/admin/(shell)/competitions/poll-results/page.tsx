import type { Metadata } from "next"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { PollResultsAdmin } from "@/components/admin/PollResultsAdmin"
import { CompetitionPicker } from "@/components/admin/CompetitionPicker"
interface CompetitionOption { id: string; title: string; type: string }

export const metadata: Metadata = {
  title: "Poll Results — Love Island Nigeria Admin",
}

const API_BASE = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const ADMIN_KEY = process.env.ADMIN_API_KEY

// ----- Data fetching ----- //

async function fetchPollCompetitions(): Promise<CompetitionOption[]> {
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
      .filter((c) => c.type === "poll")
      .map((c): CompetitionOption => ({ id: c.id, title: c.title, type: c.type }))
  } catch {
    return []
  }
}

// ----- Page ----- //

export default async function AdminPollResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>
}) {
  const { competition: competitionId } = await searchParams
  const competitions = await fetchPollCompetitions()

  // Default to first competition if none selected
  const activeId = competitionId ?? competitions[0]?.id

  return (
    <AdminPageWrapper
      title="Poll Results"
      description="Aggregated vote distributions for fan polls."
      breadcrumb={[
        { label: "Admin",        href: "/admin"              },
        { label: "Competitions", href: "/admin/competitions" },
        { label: "Poll Results"                              },
      ]}
      actions={competitions.length > 1 ? (
        <CompetitionPicker
          competitions={competitions}
          activeId={activeId}
          label="Poll"
          inputId="competition-picker"
        />
      ) : undefined}
      noPadding
    >
      {activeId ? (
        <PollResultsAdmin
          competitionId={activeId}
          title={competitions.find((c) => c.id === activeId)?.title}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <p className="text-sm text-muted-foreground">No poll competitions found.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create a poll competition to see results here.
          </p>
        </div>
      )}
    </AdminPageWrapper>
  )
}
