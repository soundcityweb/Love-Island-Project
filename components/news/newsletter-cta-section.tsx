"use client"

import { useEffect, useRef } from "react"
import { NewsletterSignupForm } from "./newsletter-signup-form"

export type NewsletterFeedback = "unsubscribed" | "error" | null

export function NewsletterCtaSection({ feedback }: { feedback: NewsletterFeedback }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!feedback) return
    const id = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 150)
    return () => clearTimeout(id)
  }, [feedback])

  return (
    <section
      ref={sectionRef}
      id="newsletter-cta"
      className="relative scroll-mt-24 overflow-hidden border-t border-border/50 px-4 py-20 md:px-8 md:py-28 lg:px-12"
      aria-label="Newsletter signup"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(255,77,128,0.07),transparent)]" />

      <div className="relative mx-auto max-w-2xl text-center">
        {feedback === "unsubscribed" && (
          <div
            role="status"
            className="mb-8 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-teal-500/15 px-5 py-4 text-left shadow-[0_8px_30px_rgb(16,185,129,0.2)] ring-2 ring-emerald-500/30 dark:border-emerald-400/50 dark:from-emerald-500/25 dark:ring-emerald-400/20 sm:text-center"
          >
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              You&apos;re unsubscribed
            </p>
            <p className="mt-2 text-base font-semibold leading-snug text-emerald-950 dark:text-emerald-50">
              You won&apos;t receive news alert emails from us anymore. You can always sign up again below.
            </p>
          </div>
        )}

        {feedback === "error" && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border-2 border-destructive/70 bg-gradient-to-br from-destructive/20 via-destructive/10 to-orange-500/10 px-5 py-4 text-left shadow-[0_8px_30px_rgb(239,68,68,0.15)] ring-2 ring-destructive/25 sm:text-center"
          >
            <p className="text-sm font-black uppercase tracking-widest text-destructive">
              Link didn&apos;t work
            </p>
            <p className="mt-2 text-base font-semibold leading-snug text-foreground">
              We couldn&apos;t process that unsubscribe link. Try again from a recent email or contact support.
            </p>
          </div>
        )}

        <div className="inline-flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.45em] text-primary">
            Never Miss the Drama
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <h2 className="mt-3 text-3xl font-black text-foreground md:text-4xl">
          Get the Villa Delivered to Your Inbox
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Every recap, every twist, every tea — straight to you before anyone else hears it.
        </p>
        <NewsletterSignupForm />
      </div>
    </section>
  )
}
