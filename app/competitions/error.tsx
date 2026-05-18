"use client"

import Link from "next/link"
import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CompetitionsListError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[/competitions] page error:", error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-foreground px-4 py-20 text-center">
      {/* Decorative glow */}
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary-foreground/30">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-primary-foreground sm:text-3xl">
          Couldn&apos;t load competitions
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/50">
          The villa games are temporarily unavailable. Our team has been notified — please try again shortly.
        </p>

        {/* Action buttons */}
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
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/[0.06] px-6 text-sm font-semibold text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10"
          >
            Go home
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
