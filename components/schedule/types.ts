export type ScheduleView = "daily" | "weekly" | "episode"
export type SchedulePlatform = "ontv" | "soundcity" | "spice" | "digital"
export type ScheduleContentType =
  | "episode"
  | "first_look"
  | "recap"
  | "podcast"
  | "highlight"
export type SlotStatus = "live" | "upcoming" | "completed"

export interface ScheduleSlot {
  id: string
  title: string
  episodeNumber: number | null
  contentType: ScheduleContentType
  platform: SchedulePlatform
  date: string
  startTime: string
  endTime: string | null
  description?: string | null
  status: SlotStatus
  isNowPlaying: boolean
}

export interface DailyPayload {
  view: "daily"
  /** Set when filtering to one day; null when listing all dates (paginated). */
  date: string | null
  listMode?: "day" | "all"
  timezone?: string
  items: ScheduleSlot[]
  hasMore?: boolean
  nextOffset?: number | null
}

export interface WeeklyPayload {
  weekStart: string
  weekEnd: string
  timezone?: string
  monday: ScheduleSlot[]
  tuesday: ScheduleSlot[]
  wednesday: ScheduleSlot[]
  thursday: ScheduleSlot[]
  friday: ScheduleSlot[]
  saturday: ScheduleSlot[]
  sunday: ScheduleSlot[]
}

export interface EpisodeGroup {
  episodeNumber: number | null
  platforms: { platform: SchedulePlatform; entries: ScheduleSlot[] }[]
}

export interface EpisodePayload {
  groups: EpisodeGroup[]
}
