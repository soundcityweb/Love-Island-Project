import Image from "next/image"
import Link from "next/link"
import type { Islander } from "@/app/types/islander"

export interface IslanderCardProps {
  islander: Islander
}

export function IslanderCard({ islander }: IslanderCardProps) {
  const { name, age, location, tagline, image, slug, status, profileStatusLabel } = islander
  const isEvicted = status === "Evicted" || status === "Eliminated"
  const isActive = status === "Active" || status === "Coupled"

  return (
    <Link
      href={`/islanders/${slug}`}
      className="group relative block overflow-hidden rounded-3xl shadow-warm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-2 hover:shadow-warm-lg hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-background"
      aria-label={`View ${name}'s profile`}
      prefetch={true}
    >
      {/* ── Photo ──────────────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={`${name}, ${age}, from ${location}`}
          width={400}
          height={533}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isEvicted ? "grayscale" : ""
          }`}
        />

        {/* Deep bottom gradient — main readability layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
        {/* Warm coral-to-orange tint — reality TV heat */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-primary/40 via-accent/10 to-transparent" />
        {/* Top vignette — keeps status badge legible */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/60 to-transparent" />

        {/* ── Status badge ─────────────────────────────────────────── */}
        <div className="absolute left-3 top-3 lg:left-4 lg:top-4">
          {profileStatusLabel ? (
            <span className="inline-flex items-center gap-1.5 rounded-full btn-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {profileStatusLabel}
            </span>
          ) : isEvicted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60 backdrop-blur-sm">
              {status === "Eliminated" ? "Eliminated" : "Evicted"}
            </span>
          ) : isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full btn-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {status === "Coupled" ? "Coupled Up" : "In the Villa"}
            </span>
          ) : status === "Winner" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              ★ Winner
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Info panel ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
        {/* "View Profile" CTA — slides up on hover */}
        <div className="mb-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-full btn-gradient px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-warm">
            View Profile →
          </span>
        </div>

        {/* Name — large, bold, unmissable */}
        <h3 className="text-2xl font-black leading-tight tracking-tight text-white drop-shadow-sm lg:text-3xl">
          {name}
          <span className="ml-2 text-base font-semibold text-white/40">{age}</span>
        </h3>

        {/* Location */}
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          {location}
        </p>

        {/* Tagline — personality, always visible */}
        {tagline && (
          <p className="mt-2 line-clamp-2 text-sm font-semibold italic leading-snug text-primary brightness-125">
            &ldquo;{tagline}&rdquo;
          </p>
        )}
      </div>

      {/* ── Gradient accent bar on hover ───────────────────────────── */}
      <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-primary via-accent to-yellow-400 transition-all duration-500 group-hover:w-full" />
    </Link>
  )
}
