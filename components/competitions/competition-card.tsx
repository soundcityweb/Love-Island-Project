"use client"

import Link from "next/link"
import { CountdownTimer } from "./countdown-timer"
import { SponsorBadge } from "./sponsor-badge"
import type { Competition, CompetitionType } from "./types"
import { TYPE_LABEL, TYPE_BADGE_CLASS, TYPE_BANNER_GRADIENT } from "./types"

// ── Decorative type icon (gradient banner fallback) ───────────────────────────

function TypeIcon({ type, className }: { type: CompetitionType; className?: string }) {
  const cls = `${className ?? "h-16 w-16"} opacity-20`

  if (type === "quiz")
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    )

  if (type === "poll")
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    )

  if (type === "prediction")
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    )

  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}

// ── Live badge ────────────────────────────────────────────────────────────────

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur-sm">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      Live
    </span>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function formatShortDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
}

// ── CompetitionCard ───────────────────────────────────────────────────────────

export interface CompetitionCardProps {
  competition: Competition
}

export function CompetitionCard({ competition: c }: CompetitionCardProps) {
  const isLive      = c.status === "active"
  const isUpcoming  = c.status === "upcoming"
  const isCompleted = c.status === "completed"

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-warm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-warm-lg">
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div className="relative h-44 overflow-hidden sm:h-48">
        {c.bannerUrl ? (
          <img
            src={c.bannerUrl}
            alt={c.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${TYPE_BANNER_GRADIENT[c.type]}`}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden
            />
            <TypeIcon type={c.type} className="h-20 w-20" />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top-left: type badge */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${TYPE_BADGE_CLASS[c.type]}`}
          >
            {TYPE_LABEL[c.type]}
          </span>
        </div>

        {/* Top-right: live badge + sponsor */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {isLive && <LiveBadge />}
          {c.sponsorName && (
            <SponsorBadge name={c.sponsorName} logoUrl={c.sponsorLogo} variant="overlay" />
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-white/90">
          {c.title}
        </h3>

        {c.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/50">
            {c.description}
          </p>
        )}

        {/* Date range + participant count */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/30">
          {c.startAt && (
            <>
              <span>{formatShortDate(c.startAt)}</span>
              {c.endAt && (
                <>
                  <span>→</span>
                  <span>{formatShortDate(c.endAt)}</span>
                </>
              )}
            </>
          )}
          {c.participantCount > 0 && (
            <>
              <span className="mx-1 text-white/15">·</span>
              <span>{c.participantCount.toLocaleString("en-NG")} joined</span>
            </>
          )}
        </div>

        {/* Countdown */}
        {isLive && c.endAt && (
          <CountdownTimer targetIso={c.endAt} label="ends" variant="card" />
        )}
        {isUpcoming && c.startAt && (
          <CountdownTimer targetIso={c.startAt} label="starts" variant="card" />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="mt-1">
          {isLive && (
            <Link
              href={`/competitions/${c.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl btn-gradient px-4 py-2.5 text-sm font-bold text-white shadow-warm transition-all hover:-translate-y-px hover:shadow-warm-lg"
            >
              <PlayIcon className="h-4 w-4" />
              Play Now
            </Link>
          )}

          {isUpcoming && (
            <span className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/50">
              <ClockIcon className="h-4 w-4" />
              Starts Soon
            </span>
          )}

          {isCompleted && (
            <Link
              href={`/competitions/${c.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-300 transition-all hover:-translate-y-px hover:bg-purple-500/20"
            >
              <TrophyIcon className="h-4 w-4" />
              View Results
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

// ── CompetitionCardSkeleton ───────────────────────────────────────────────────

export function CompetitionCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
      {/* Banner */}
      <div className="h-44 animate-pulse bg-white/5 sm:h-48" />
      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/8" />
        <div className="space-y-1.5">
          <div className="h-3.5 animate-pulse rounded-full bg-white/5" />
          <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-white/5" />
        </div>
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-white/5" />
        <div className="mt-2 h-10 animate-pulse rounded-xl bg-white/5" />
      </div>
    </div>
  )
}

// ── Micro icons ───────────────────────────────────────────────────────────────

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  )
}
