/**
 * Converts an ISO-8601 timestamp into a human-readable relative string,
 * e.g. "just now", "3 minutes ago", "2 hours ago", "5 days ago".
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return "just now"

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`

  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`

  const diffMo = Math.floor(diffDay / 30)
  if (diffMo < 12) return `${diffMo} month${diffMo === 1 ? "" : "s"} ago`

  const diffYr = Math.floor(diffMo / 12)
  return `${diffYr} year${diffYr === 1 ? "" : "s"} ago`
}
