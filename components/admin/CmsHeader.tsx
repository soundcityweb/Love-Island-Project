/**
 * Shared sticky header for CMS admin pages (news, videos, islanders, landing).
 *
 * Usage:
 *   // Read-only section (no action button)
 *   <CmsHeader title="Islanders" />
 *
 *   // With an action button on the right
 *   <CmsHeader title="News & Articles" right={<button onClick={openDialog}>+ New Article</button>} />
 */

import Link from "next/link"

type CmsHeaderProps = {
  /** Page name shown after "← Dashboard /", e.g. "News & Articles". */
  title: string
  /** Optional element rendered on the right (typically a "+ New …" button). */
  right?: React.ReactNode
}

export function CmsHeader({ title, right }: CmsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {right}
      </div>
    </header>
  )
}
