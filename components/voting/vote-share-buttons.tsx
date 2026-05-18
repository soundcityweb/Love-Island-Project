"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Share2 } from "lucide-react"

function buildShareText(pageUrl: string) {
  const link = pageUrl.trim()
  return link
    ? `Vote for your favourite Islander now! ${link}`
    : "Vote for your favourite Islander now!"
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

const toneStyles = {
  default: {
    afterVoteHeading: "text-primary-foreground/45",
    afterVoteBorder: "border-primary-foreground/10",
    afterVoteHint: "text-primary-foreground/35",
    neutralBtn:
      "border-primary-foreground/15 bg-primary-foreground/[0.06] text-primary-foreground hover:bg-primary-foreground/10",
    nativeBtn: "border-primary/40 bg-primary/15 text-primary-foreground",
    xBtn: "border-primary-foreground/15 bg-primary-foreground/[0.06] text-primary-foreground hover:bg-primary-foreground/10",
  },
  success: {
    afterVoteHeading: "text-emerald-200/80",
    afterVoteBorder: "border-emerald-400/25",
    afterVoteHint: "text-emerald-200/55",
    neutralBtn:
      "border-emerald-400/30 bg-emerald-950/40 text-emerald-50 hover:bg-emerald-950/60",
    nativeBtn: "border-emerald-400/45 bg-emerald-900/45 text-emerald-50",
    xBtn: "border-emerald-400/30 bg-emerald-950/40 text-emerald-50 hover:bg-emerald-950/60",
  },
  duplicate: {
    afterVoteHeading: "text-red-200/80",
    afterVoteBorder: "border-red-400/25",
    afterVoteHint: "text-red-200/55",
    neutralBtn:
      "border-red-400/30 bg-red-950/40 text-red-50 hover:bg-red-950/60",
    nativeBtn: "border-red-400/45 bg-red-900/45 text-red-50",
    xBtn: "border-red-400/30 bg-red-950/40 text-red-50 hover:bg-red-950/60",
  },
} as const

export interface VoteShareButtonsProps {
  /** Larger heading + spacing after vote */
  variant?: "compact" | "afterVote"
  /** Match surrounding alert card (success / duplicate) */
  tone?: keyof typeof toneStyles
  className?: string
}

export function VoteShareButtons({
  variant = "compact",
  tone = "default",
  className = "",
}: VoteShareButtonsProps) {
  const [pageUrl, setPageUrl] = useState("")
  const [showNativeShare, setShowNativeShare] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setPageUrl(window.location.href.split("#")[0])
    setShowNativeShare(typeof navigator.share === "function")
  }, [])

  const shareText = pageUrl ? buildShareText(pageUrl) : buildShareText("")

  const openUrl = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer")
  }, [])

  const shareWhatsApp = useCallback(() => {
    openUrl(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
  }, [openUrl, shareText])

  const shareFacebook = useCallback(() => {
    if (!pageUrl) return
    openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`)
  }, [openUrl, pageUrl])

  const shareX = useCallback(() => {
    if (!pageUrl) return
    const text = "Vote for your favourite Islander now!"
    openUrl(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`,
    )
  }, [openUrl, pageUrl])

  const copyForInstagram = useCallback(async () => {
    const toCopy = shareText.trim() || pageUrl
    try {
      await navigator.clipboard.writeText(toCopy)
      toast.success("Copied — paste in Instagram (stories, DM, or caption)")
    } catch {
      toast.error("Could not copy. Select and copy the address from your browser.")
    }
  }, [pageUrl, shareText])

  const nativeShare = useCallback(async () => {
    if (!navigator.share || !pageUrl) return
    try {
      await navigator.share({
        title: "Love Island Nigeria — Vote",
        text: "Vote for your favourite Islander now!",
        url: pageUrl,
      })
    } catch {
      /* user cancelled */
    }
  }, [pageUrl])

  const afterVote = variant === "afterVote"
  const t = toneStyles[tone]
  const btnBase =
    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.98] sm:min-w-[48px] sm:px-5"
  const iconClass = "h-5 w-5 shrink-0"

  return (
    <div
      className={`w-full min-w-0 max-w-full ${afterVote ? `mt-6 border-t pt-6 ${t.afterVoteBorder}` : ""} ${className}`}
    >
      {afterVote && (
        <p
          className={`mb-3 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${t.afterVoteHeading}`}
        >
          Share with friends
        </p>
      )}
      {!afterVote && (
        <p className="mb-2 text-center text-xs text-primary-foreground/50">
          Share this page
        </p>
      )}
      <div
        className={`flex min-w-0 flex-wrap items-center justify-center gap-2 sm:gap-3 ${
          afterVote ? "mx-auto max-w-md" : ""
        }`}
        role="group"
        aria-label="Share voting page"
      >
        {showNativeShare && pageUrl && (
          <button
            type="button"
            onClick={nativeShare}
            className={`${btnBase} gap-2 ${t.nativeBtn}`}
            aria-label="Share using your device"
          >
            <Share2 className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
        <button
          type="button"
          onClick={shareWhatsApp}
          className={`${btnBase} gap-2 ${t.neutralBtn} text-[#25D366]`}
          aria-label="Share on WhatsApp"
        >
          <IconWhatsApp className={iconClass} />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>
        <button
          type="button"
          onClick={shareFacebook}
          disabled={!pageUrl}
          className={`${btnBase} gap-2 ${t.neutralBtn} text-[#1877F2] disabled:opacity-50`}
          aria-label="Share on Facebook"
        >
          <IconFacebook className={iconClass} />
          <span className="hidden sm:inline">Facebook</span>
        </button>
        <button
          type="button"
          onClick={shareX}
          disabled={!pageUrl}
          className={`${btnBase} gap-2 ${t.xBtn} disabled:opacity-50`}
          aria-label="Share on X"
        >
          <IconX className={iconClass} />
          <span className="hidden sm:inline">X</span>
        </button>
        <button
          type="button"
          onClick={copyForInstagram}
          className={`${btnBase} gap-2 bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white border-white/20`}
          aria-label="Copy link for Instagram"
        >
          <IconInstagram className={iconClass} />
          <span className="hidden sm:inline">Instagram</span>
        </button>
      </div>
      {afterVote && (
        <p className={`mt-2 text-center text-[11px] ${t.afterVoteHint}`}>
          Instagram opens the app when you paste the link in stories or DMs.
        </p>
      )}
    </div>
  )
}
