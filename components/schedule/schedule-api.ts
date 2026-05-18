import type { SchedulePlatform, ScheduleView } from "./types"

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/

/** Exported for schedule page (daily “all dates” vs single-day). */
export function effectiveScheduleDate(date: string): string | undefined {
  const t = date.trim()
  if (!t || !YMD_RE.test(t)) return undefined
  return t
}

const DEFAULT_PAGE_SIZE = 30

export function scheduleQueryKey(opts: {
  view: ScheduleView
  platform: SchedulePlatform | null
  date: string
}) {
  if (opts.view === "episode") {
    return ["schedule", "episode", opts.platform ?? "all"] as const
  }
  const d = effectiveScheduleDate(opts.date)
  return ["schedule", opts.view, opts.platform ?? "all", d ?? "today"] as const
}

export function buildScheduleSearchParams(opts: {
  view: ScheduleView
  platform: SchedulePlatform | null
  date: string
  /** Daily all-dates mode only */
  offset?: number
  limit?: number
}): URLSearchParams {
  const p = new URLSearchParams()
  p.set("view", opts.view)
  if (opts.platform) p.set("platform", opts.platform)
  if (opts.view === "daily" || opts.view === "weekly") {
    const d = effectiveScheduleDate(opts.date)
    if (d) {
      p.set("date", d)
    } else if (opts.view === "daily") {
      const limit = opts.limit ?? DEFAULT_PAGE_SIZE
      p.set("limit", String(limit))
      const offset = opts.offset ?? 0
      if (offset > 0) p.set("offset", String(offset))
    }
  }
  return p
}

export { DEFAULT_PAGE_SIZE as SCHEDULE_PAGE_SIZE }

export async function fetchSchedule(
  params: URLSearchParams,
): Promise<unknown> {
  const res = await fetch(`/api/schedule?${params.toString()}`, {
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `Could not load schedule (${res.status})`
    throw new Error(msg)
  }
  return data
}
