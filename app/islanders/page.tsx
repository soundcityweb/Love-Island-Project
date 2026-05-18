import type { Metadata } from "next"
import { IslandersGrid } from "@/components/islanders/islanders-grid"
import { fetchIslanders } from "@/app/lib/api-server"
import { mapIslanderListItem } from "@/app/lib/mappers"
import type { Islander } from "@/app/types/islander"

export const metadata: Metadata = {
  title: "Meet the Islanders - Love Island Nigeria",
  description:
    "Get to know the bold, beautiful, and unforgettable cast of Love Island Nigeria Season 1. View profiles, stats, and more.",
}

/**
 * Map API status to display status
 */
function mapStatusToDisplayStatus(
  apiStatus: string
): Islander["status"] {
  const statusMap: Record<string, Islander["status"]> = {
    cast: "Active",
    in_villa: "Active",
    coupled: "Coupled",
    eliminated: "Eliminated",
    winner: "Winner",
  }
  return statusMap[apiStatus] || "Active"
}

/**
 * Transform API islander data to include display status
 */
function transformIslanderForListing(
  islander: ReturnType<typeof mapIslanderListItem> & { status?: string }
): Islander {
  return {
    ...islander,
    status: islander.status
      ? mapStatusToDisplayStatus(islander.status)
      : "Active",
  }
}

export default async function IslandersPage() {
  // Fetch islanders from API
  const islandersData = await fetchIslanders()

  // Transform API data to typed Islander interface
  const islanders: Islander[] = islandersData.map((item) => {
    const mapped = mapIslanderListItem(item)
    return transformIslanderForListing({
      ...mapped,
      status: item.status,
    })
  })

  return (
    <main className="min-h-screen bg-background">
        {/* Hero section — tropical sunset backdrop */}
        <section className="relative overflow-hidden px-4 md:px-8 pb-16 pt-20 lg:px-12 lg:pb-24 lg:pt-32">
          {/* Sunset gradient backdrop */}
          <div className="absolute inset-0 bg-li-sunset" />
          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
          {/* Radial glow — warm centrepiece */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

          <div className="relative mx-auto max-w-7xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
              ✦ &nbsp;Love Island Nigeria &nbsp;·&nbsp; Season 1&nbsp; ✦
            </p>
            <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
              Meet the<br className="hidden sm:block" /> Islanders
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
              Sun-kissed, stunning, and dangerously single. These are the bold
              souls who left everything behind for a shot at love — and
              they&apos;re absolutely not here to make friends.
            </p>

            {/* Stat divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px max-w-[80px] flex-1 bg-white/25" />
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                {islanders.length} Islanders &nbsp;·&nbsp; One Villa &nbsp;·&nbsp; Infinite Drama
              </p>
            </div>
          </div>
        </section>

        {/* Grid section */}
        <section className="px-4 md:px-8 py-16 md:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <IslandersGrid islanders={islanders} />
          </div>
        </section>
    </main>
  )
}
