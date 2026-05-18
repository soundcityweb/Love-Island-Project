"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { DailyTimeline } from "./DailyTimeline"
import { EpisodeList } from "./EpisodeList"
import { PlatformFilter } from "./PlatformFilter"
import {
  buildScheduleSearchParams,
  effectiveScheduleDate,
  fetchSchedule,
  scheduleQueryKey,
  SCHEDULE_PAGE_SIZE,
} from "./schedule-api"
import { ScheduleErrorState } from "./ScheduleErrorState"
import { ScheduleLoadingSkeleton } from "./ScheduleLoadingSkeleton"
import { localYmd } from "./schedule-utils"
import type {
  DailyPayload,
  EpisodePayload,
  SchedulePlatform,
  ScheduleView,
  WeeklyPayload,
} from "./types"
import { ViewSwitcher } from "./ViewSwitcher"
import { WeeklyGrid } from "./WeeklyGrid"

export function SchedulePageClient() {
  const [view, setView] = useState<ScheduleView>("daily")
  const [platform, setPlatform] = useState<SchedulePlatform | null>(null)
  const [selectedDate, setSelectedDate] = useState("")

  const dateFilter = effectiveScheduleDate(selectedDate)
  const dailyAllMode = view === "daily" && !dateFilter

  const infiniteDaily = useInfiniteQuery({
    queryKey: ["schedule", "daily", "all", platform ?? "all"] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const params = buildScheduleSearchParams({
        view: "daily",
        platform,
        date: "",
        offset: pageParam,
        limit: SCHEDULE_PAGE_SIZE,
      })
      const data = await fetchSchedule(params)
      if (!isDailyPayload(data)) throw new Error("Invalid schedule response")
      return data
    },
    getNextPageParam: (last) =>
      last.hasMore === true && last.nextOffset != null ? last.nextOffset : undefined,
    enabled: dailyAllMode,
  })

  const mergedDailyItems = useMemo(
    () => infiniteDaily.data?.pages.flatMap((p) => p.items) ?? [],
    [infiniteDaily.data],
  )

  const standardQuery = useQuery({
    queryKey: scheduleQueryKey({ view, platform, date: selectedDate }),
    queryFn: async () =>
      fetchSchedule(
        buildScheduleSearchParams({
          view,
          platform,
          date: selectedDate,
        }),
      ),
    enabled: !dailyAllMode,
  })

  const isPending = dailyAllMode ? infiniteDaily.isPending : standardQuery.isPending
  const isError = dailyAllMode ? infiniteDaily.isError : standardQuery.isError
  const error = dailyAllMode ? infiniteDaily.error : standardQuery.error
  const refetch = dailyAllMode
    ? () => void infiniteDaily.refetch()
    : () => void standardQuery.refetch()
  const isFetching = dailyAllMode ? infiniteDaily.isFetching : standardQuery.isFetching

  const fetchNext = infiniteDaily.fetchNextPage
  const hasNextPage = infiniteDaily.hasNextPage
  const isFetchingNextPage = infiniteDaily.isFetchingNextPage

  const onLoadMore = useCallback(() => {
    if (!dailyAllMode || !hasNextPage || isFetchingNextPage) return
    void fetchNext()
  }, [dailyAllMode, hasNextPage, isFetchingNextPage, fetchNext])

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!dailyAllMode) return
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const [e] = entries
        if (e?.isIntersecting) onLoadMore()
      },
      { root: null, rootMargin: "280px", threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [dailyAllMode, onLoadMore, mergedDailyItems.length])

  const showDateControls = view === "daily" || view === "weekly"
  const standardData = standardQuery.data

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero (News / Podcasts listing pattern) ───────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-li-sunset" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;On Air &amp; On Demand &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
            When the
            <br className="hidden sm:block" /> Drama Drops
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
            Daily rundown, full week grid, and episodes by platform — catch every moment across TV
            and digital.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              TV &amp; Digital &nbsp;·&nbsp; First Looks &amp; Podcasts &nbsp;·&nbsp; Always On
            </p>
          </div>
        </div>
      </section>

      {/* ── Filters (News category strip pattern) ────────────────────────── */}
      <section
        className="border-b border-border bg-card px-4 py-4 md:px-8 lg:px-12"
        aria-label="Schedule filters"
      >
        <div className="mx-auto max-w-7xl space-y-4">
          <ViewSwitcher view={view} onViewChange={setView} />

          {showDateControls && (
            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="shrink-0 text-muted-foreground">Date</span>
                    {view === "daily" && (
                      <span className="text-xs font-normal text-muted-foreground">
                        Optional — leave blank for full list (scroll to load more).
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full max-w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-auto"
                    />
                    {view === "daily" && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(localYmd())}
                        className="rounded-full border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                      >
                        Today
                      </button>
                    )}
                  </div>
                </label>
              </div>
              {isFetching && !isPending && (
                <span className="text-xs font-medium text-muted-foreground">Updating…</span>
              )}
            </div>
          )}

          <PlatformFilter platform={platform} onPlatformChange={setPlatform} />
        </div>
      </section>

      {/* ── Listing ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24 lg:px-12" aria-label="Schedule listing">
        <div className="mx-auto max-w-7xl">
          {isPending && <ScheduleLoadingSkeleton />}

          {isError && !isPending && (
            <ScheduleErrorState
              message={error instanceof Error ? error.message : "Something went wrong."}
              onRetry={() => void refetch()}
            />
          )}

          {!isPending && !isError && dailyAllMode && (
            <>
              <DailyTimeline items={mergedDailyItems} date={null} listMode="all" />
              <div
                ref={sentinelRef}
                className="flex min-h-12 items-center justify-center py-4"
                aria-hidden
              />
              {isFetchingNextPage && (
                <p className="pb-8 text-center text-sm text-muted-foreground">Loading more…</p>
              )}
            </>
          )}

          {!isPending && !isError && !dailyAllMode && view === "daily" && isDailyPayload(standardData) ? (
            <DailyTimeline
              items={standardData.items}
              date={standardData.date}
              listMode={standardData.listMode === "all" ? "all" : "day"}
            />
          ) : null}

          {!isPending && !isError && !dailyAllMode && view === "weekly" && isWeeklyPayload(standardData) ? (
            <WeeklyGrid payload={standardData} />
          ) : null}

          {!isPending && !isError && !dailyAllMode && view === "episode" && isEpisodePayload(standardData) ? (
            <EpisodeList groups={standardData.groups} />
          ) : null}
        </div>
      </section>
    </main>
  )
}

function isDailyPayload(d: unknown): d is DailyPayload {
  return (
    typeof d === "object" &&
    d !== null &&
    (d as { view?: string }).view === "daily" &&
    "items" in d &&
    Array.isArray((d as DailyPayload).items)
  )
}

function isWeeklyPayload(d: unknown): d is WeeklyPayload {
  return (
    typeof d === "object" &&
    d !== null &&
    "monday" in d &&
    "weekStart" in d
  )
}

function isEpisodePayload(d: unknown): d is EpisodePayload {
  return (
    typeof d === "object" &&
    d !== null &&
    "groups" in d &&
    Array.isArray((d as EpisodePayload).groups)
  )
}
