// SponsorBadge — intentionally a server-compatible component (no "use client")

import Image from "next/image"

export interface SponsorBadgeProps {
  name: string
  /** Cloudinary / remote logo URL — optional */
  logoUrl?: string | null
  /**
   * `overlay`  — dark pill on banner images (compact, backdrop-blur)
   * `card`     — slightly larger pill used inside card bodies
   * `inline`   — plain text with a tag icon, for detail sidebars
   */
  variant?: "overlay" | "card" | "inline"
  className?: string
}

export function SponsorBadge({
  name,
  logoUrl,
  variant = "overlay",
  className = "",
}: SponsorBadgeProps) {
  // ── Overlay (on banner images) ────────────────────────────────────────────
  if (variant === "overlay") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-sm ${className}`}
      >
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={name}
            width={14}
            height={14}
            className="h-3.5 w-3.5 rounded-full object-contain"
          />
        )}
        {name}
      </span>
    )
  }

  // ── Card (inside card body) ───────────────────────────────────────────────
  if (variant === "card") {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-2 ${className}`}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-contain"
          />
        ) : (
          <TagIcon className="h-3.5 w-3.5 shrink-0 text-white/30" />
        )}
        <span className="text-xs text-white/45">Sponsored by</span>
        <span className="text-xs font-bold text-white/70">{name}</span>
      </div>
    )
  }

  // ── Inline (detail sidebar / hero) ────────────────────────────────────────
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-sm ${className}`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={16}
          height={16}
          className="h-4 w-4 rounded-full object-contain"
        />
      ) : (
        <TagIcon className="h-3 w-3 shrink-0 text-white/40" />
      )}
      <span className="text-[11px] font-semibold text-white/65">
        Sponsored by {name}
      </span>
    </div>
  )
}

// ── Internal icon ─────────────────────────────────────────────────────────────

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"
      />
    </svg>
  )
}
