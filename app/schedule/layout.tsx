import type { Metadata } from "next"
import { ScheduleQueryProvider } from "@/components/schedule/schedule-query-provider"

export const metadata: Metadata = {
  title: "Schedule | When the Drama Drops | Love Island Nigeria",
  description:
    "Catch every moment across TV and digital — daily rundown, full week grid, and episodes by platform for Love Island Nigeria.",
}

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ScheduleQueryProvider>{children}</ScheduleQueryProvider>
}
