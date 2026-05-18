import type { ScheduleContentType, SchedulePlatform } from "./types"

export const WEEK_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type WeekKey = (typeof WEEK_KEYS)[number]

export const WEEK_LABEL: Record<WeekKey, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
}

export const PLATFORM_FILTERS: { id: SchedulePlatform | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "ontv", label: "ONTV" },
  { id: "soundcity", label: "Soundcity" },
  { id: "spice", label: "Spice" },
  { id: "digital", label: "Digital" },
]

export function localYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function platformLabel(p: SchedulePlatform): string {
  switch (p) {
    case "ontv":
      return "On TV"
    case "soundcity":
      return "Soundcity"
    case "spice":
      return "Spice"
    case "digital":
      return "Digital"
    default:
      return p
  }
}

export function typeLabel(t: ScheduleContentType): string {
  switch (t) {
    case "first_look":
      return "First look"
    case "highlight":
      return "Highlight"
    default:
      return t.charAt(0).toUpperCase() + t.slice(1)
  }
}

export function formatTimeShort(hms: string): string {
  const p = hms.split(":")
  if (p.length < 2) return hms
  return `${p[0].padStart(2, "0")}:${p[1].padStart(2, "0")}`
}

/** 12-hour label, e.g. 20:00 → 8PM, 20:30 → 8:30PM */
export function formatTime12h(hms: string): string {
  const parts = hms.split(":").map((x) => parseInt(x, 10))
  const hour24 = parts[0] ?? 0
  const min = parts[1] ?? 0
  const period = hour24 >= 12 ? "PM" : "AM"
  let h12 = hour24 % 12
  if (h12 === 0) h12 = 12
  if (min === 0) return `${h12}${period}`
  return `${h12}:${String(min).padStart(2, "0")}${period}`
}

/** Short label for broadcast rows (e.g. ONTV). */
export function broadcastPlatformLabel(p: SchedulePlatform): string {
  switch (p) {
    case "ontv":
      return "ONTV"
    case "soundcity":
      return "Soundcity"
    case "spice":
      return "Spice"
    case "digital":
      return "Digital"
    default:
      return p
  }
}

export function formatDayDate(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ymd
  return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
}

/** e.g. 31 Mar — under Mon–Sun column headers */
export function formatDayMonth(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ymd
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function platformBadgeClass(p: SchedulePlatform): string {
  switch (p) {
    case "ontv":
      return "bg-[#FF7A17]/20 text-[#9a3d00] ring-1 ring-[#FF7A17]/35"
    case "soundcity":
      return "bg-[#580CE3]/15 text-[#3d0999] ring-1 ring-[#580CE3]/30"
    case "spice":
      return "bg-[#FF36A0]/15 text-[#b3006b] ring-1 ring-[#FF36A0]/35"
    case "digital":
      return "bg-sky-500/15 text-sky-900 ring-1 ring-sky-400/35"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
