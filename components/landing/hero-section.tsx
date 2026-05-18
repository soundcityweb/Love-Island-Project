import Image from "next/image"
import Link from "next/link"
import type { HeroContent } from "@/app/types/landing"

export interface HeroSectionProps {
  content: HeroContent
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ── Full-width background image ───────────────────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src={content.backgroundImage}
          alt="Love Island Nigeria villa"
          fill
          className="scale-105 object-cover object-top"
          priority
        />

        {/* Multi-layer cinematic gradient overlay */}
        {/* Top: darken for header legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 to-black/90" />
        {/* Bottom: brand colour tint rising from footer */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/20 to-transparent" />
        {/* Side vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_50%,rgba(0,0,0,.55)_100%)]" />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-28 text-center">

        {/* Season badge — enters first */}
        <div className="mb-8 inline-flex animate-fade-up items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-primary">
            {content.season}
          </span>
          <span className="h-px w-10 bg-primary" />
        </div>

        {/* Headline — enters second */}
        <h1
          className="animate-fade-up font-black uppercase leading-none tracking-tighter text-white [animation-delay:150ms]"
          style={{ fontSize: "clamp(3.25rem, 11vw, 9.5rem)" }}
        >
          {content.title}
          <br />
          <span className="italic text-primary">{content.titleHighlight}</span>
        </h1>

        {/* Subtext — enters between headline and description */}
        <p className="mt-4 animate-fade-up font-mono text-sm font-medium uppercase tracking-[0.35em] text-white [animation-delay:220ms]">
          find love or cause chaos
        </p>

        {/* Description — enters third */}
        <p className="mx-auto mt-8 max-w-xl animate-fade-up text-pretty text-lg leading-relaxed text-white/70 [animation-delay:300ms] md:text-xl">
          {content.description}
        </p>

        {/* ── CTA buttons — enter fourth ────────────────────────────────── */}
        <div className="mt-12 flex animate-fade-up flex-col items-center gap-4 [animation-delay:480ms] sm:flex-row sm:flex-wrap sm:justify-center">
          {/* Primary */}
          <Link
            href={content.ctaPrimary.href}
            className="inline-flex min-w-[210px] items-center justify-center rounded-full btn-gradient px-10 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-warm-lg transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
          >
            Be an Islander
          </Link>

          {/* Secondary */}
          <a
            href={content.ctaSecondary.href}
            className="inline-flex min-w-[210px] items-center justify-center rounded-full border-2 border-white/40 px-10 py-4 text-sm font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-white/70 hover:bg-white/10"
          >
            Meet the Islanders
          </a>

          <Link
            href="/schedule"
            className="inline-flex min-w-[210px] items-center justify-center rounded-full border-2 border-primary/60 bg-primary/15 px-10 py-4 text-sm font-black uppercase tracking-[0.18em] text-primary backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:bg-primary/25"
          >
            View Schedule
          </Link>
        </div>

        {/* ── Stats row — enters last ────────────────────────────────────── */}
        <div className="mt-20 flex animate-fade-up items-center justify-center gap-8 [animation-delay:660ms] md:gap-16">
          <div className="text-center">
            <p className="font-mono text-4xl font-bold text-primary md:text-5xl">
              {content.stats.applicants}
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              Applicants
            </p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="text-center">
            <p className="font-mono text-4xl font-bold text-primary md:text-5xl">
              {content.stats.days}
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              Days of Love
            </p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="text-center">
            <p className="font-mono text-4xl font-bold text-primary md:text-5xl">
              {content.stats.winningCouple}
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              Winning Couple
            </p>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <a
        href="#countdown"
        aria-label="Scroll to next section"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 cursor-pointer transition-opacity duration-200 hover:opacity-60"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
        </div>
      </a>
    </section>
  )
}
