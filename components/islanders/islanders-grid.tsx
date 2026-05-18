"use client"

import { useState } from "react"
import { IslanderCard } from "./islander-card"
import type { Islander } from "@/app/types/islander"

interface IslandersGridProps {
  islanders: Islander[]
}

export function IslandersGrid({ islanders }: IslandersGridProps) {
  const [filter, setFilter] = useState<"all" | "active">("all")

  const filtered =
    filter === "all"
      ? islanders
      : islanders.filter(
          (i) => i.status === "Active" || i.status === "Coupled"
        )

  const activeCount = islanders.filter(
    (i) => i.status === "Active" || i.status === "Coupled"
  ).length

  return (
    <div>
      {/* Filter toggle */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-black text-base text-foreground">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "islander" : "islanders"} in the spotlight
        </p>

        <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 ${
              filter === "all"
                ? "btn-gradient text-white shadow-warm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={filter === "all"}
          >
            Full Cast ({islanders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 ${
              filter === "active"
                ? "btn-gradient text-white shadow-warm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={filter === "active"}
          >
            Still Standing ({activeCount})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
        {filtered.map((islander) => (
          <IslanderCard key={islander.slug} islander={islander} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center py-16 text-center">
          <p className="text-2xl font-black text-foreground">
            The Villa is quiet… for now.
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            No islanders match this filter. Switch to Full Cast to see everyone.
          </p>
        </div>
      )}
    </div>
  )
}
