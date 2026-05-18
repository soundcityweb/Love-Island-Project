"use client"

import { useState } from "react"

interface ShareBarProps {
  title: string
  /** When compact, renders small icon-only buttons (used in the byline row). */
  compact?: boolean
}

function openPopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=400")
}

export function ShareBar({ title, compact = false }: ShareBarProps) {
  const [copied, setCopied] = useState(false)

  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : ""

  const shareToTwitter = () => {
    const url = getUrl()
    openPopup(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    )
  }

  const shareToFacebook = () => {
    openPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`,
    )
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select a hidden input
    }
  }

  const btnClass = compact
    ? "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"

  return (
    <div className="flex items-center gap-2" aria-label="Share this article">
      <button
        type="button"
        onClick={shareToTwitter}
        className={btnClass}
        aria-label="Share on Twitter"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={shareToFacebook}
        className={btnClass}
        aria-label="Share on Facebook"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={copyLink}
        className={`${btnClass} relative`}
        aria-label={copied ? "Link copied!" : "Copy link"}
      >
        {copied ? (
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        )}
      </button>

      {copied && (
        <span
          role="status"
          aria-live="polite"
          className="text-xs font-medium text-primary"
        >
          Copied!
        </span>
      )}
    </div>
  )
}
