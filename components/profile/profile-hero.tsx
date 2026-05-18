import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface ProfileHeroProps {
  name: string
  age: number
  location: string
  occupation: string
  tagline: string
  image: string
  coverImage: string
  status: string
  profileStatusLabel?: string | null
}

export function ProfileHero({
  name,
  age,
  location,
  occupation,
  tagline,
  image,
  coverImage,
  status,
  profileStatusLabel,
}: ProfileHeroProps) {
  const badgeLabel = profileStatusLabel ?? status
  const isEvicted = status === "Evicted" || status === "Eliminated"
  const isWinner = status === "Winner"

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      {/* ── Full-bleed cover image ──────────────────────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src={coverImage || "/images/hero-bg.jpg"}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Deep dark gradient — readability base */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/65 to-foreground/20" />
        {/* Left-side depth fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/55 via-foreground/10 to-transparent" />
        {/* Tropical warm glow rising from bottom */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/25 via-accent/10 to-transparent" />
        {/* Soft radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_25%_85%,rgba(255,77,128,0.18),transparent)]" />
      </div>

      {/* ── Bottom fade — blends seamlessly into next section ───────────── */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background to-transparent" />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 pb-32 pt-28 lg:pb-40 lg:pt-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Back link */}
          <Link
            href="/islanders"
            className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Back to Islanders</span>
          </Link>

          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:gap-20">

            {/* ── Profile photo with gradient ring ────────────────────── */}
            <div className="relative shrink-0">
              {/* Gradient border ring */}
              <div className="rounded-2xl bg-li-gradient p-[3px] shadow-warm-lg">
                <div className="relative h-[380px] w-[300px] overflow-hidden rounded-2xl sm:h-[480px] sm:w-[370px] lg:h-[520px] lg:w-[400px]">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${name}, ${age}, from ${location}`}
                    fill
                    className={`object-cover transition-transform duration-700 hover:scale-105 ${
                      isEvicted ? "grayscale" : ""
                    }`}
                    priority
                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 370px, 400px"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-foreground/50 to-transparent" />
                </div>
              </div>

              {/* Status badge */}
              {isWinner ? (
                <span className="absolute -bottom-4 left-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                  ★ Winner
                </span>
              ) : (
                <span className="absolute -bottom-4 left-6 inline-flex items-center gap-1.5 rounded-full btn-gradient px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-warm">
                  {!isEvicted && (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  )}
                  {badgeLabel}
                </span>
              )}
            </div>

            {/* ── Info block ───────────────────────────────────────────── */}
            <div className="flex-1 pb-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/50">
                ✦ &nbsp;Love Island Nigeria &nbsp;·&nbsp; Season 1&nbsp; ✦
              </p>

              {/* Name — cinematic headline */}
              <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl xl:text-8xl">
                {name}
                <span className="text-white/25">, {age}</span>
              </h1>

              {/* Attribute tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {location}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {occupation}
                </span>
              </div>

              {/* Tagline — signature quote */}
              {tagline && (
                <div className="relative mt-10">
                  {/* Decorative oversized quote mark */}
                  <span className="absolute -left-1 -top-6 select-none text-8xl font-black leading-none text-primary/30 lg:text-9xl">
                    &ldquo;
                  </span>
                  <blockquote className="relative pl-6 text-xl font-bold italic leading-relaxed text-white/90 lg:text-2xl">
                    {tagline}
                  </blockquote>
                  {/* Gradient accent line */}
                  <div className="ml-6 mt-5 h-[2px] w-20 bg-gradient-to-r from-primary to-accent" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
