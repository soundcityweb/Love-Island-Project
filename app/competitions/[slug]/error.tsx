"use client"

import Link from "next/link"
import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CompetitionDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[/competitions/[slug]] page error:", error)
  }, [error])

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-foreground px-4 py-20 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,77,128,0.10),transparent)]" aria-hidden />

      <div className="relative mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary-foreground/20 bg-primary-foreground/[0.04]">
            <svg
              className="h-10 w-10 text-primary-foreground/30"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary-foreground/30">
          Game error
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-primary-foreground sm:text-3xl">
          This challenge couldn&apos;t load
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/50">
          Something went wrong loading this competition. Try refreshing, or browse other challenges in the villa.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-2 rounded-full btn-gradient px-6 text-sm font-bold text-white shadow-warm transition-all hover:-translate-y-px hover:shadow-warm-lg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Try again
          </button>
          <Link
            href="/competitions"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/[0.06] px-6 text-sm font-semibold text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            All competitions
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-[10px] text-primary-foreground/20">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}
