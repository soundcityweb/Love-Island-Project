import type { Metadata } from "next"
import type { SVGProps } from "react"
import Link from "next/link"
import { MapPin, Mail, Phone, Instagram, Youtube } from "lucide-react"

import { ContactFormClient } from "@/components/forms/contact/contact-form-client"
import { CONTACT_DISPLAY } from "@/app/lib/contact-constants"

export const metadata: Metadata = {
  title: "Contact Us | Love Island Nigeria",
  description:
    "Get in touch with Love Island Nigeria — questions, feedback, partnerships, and support. We’d love to hear from you.",
  openGraph: {
    title: "Contact Us | Love Island Nigeria",
    description:
      "Questions, feedback, or partnerships — reach the Love Island Nigeria team.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Love Island Nigeria",
  url: "https://loveislandnigeria.com",
  email: CONTACT_DISPLAY.email,
  telephone: CONTACT_DISPLAY.phone,
  sameAs: [CONTACT_DISPLAY.instagram, CONTACT_DISPLAY.twitter, CONTACT_DISPLAY.youtube],
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-background">
        {/* Hero — same overlay header + sunset treatment as Privacy / News / Podcasts */}
        <section
          className="relative overflow-hidden px-4 pb-12 pt-20 md:px-8 lg:px-12 lg:pb-16 lg:pt-32"
          aria-labelledby="contact-hero-heading"
        >
          <div className="absolute inset-0 bg-li-sunset" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

          <div className="relative mx-auto max-w-7xl text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
              ✦ &nbsp;Love Island Nigeria&nbsp; ✦
            </p>
            <h1
              id="contact-hero-heading"
              className="mt-4 text-balance font-display text-4xl font-black tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl"
            >
              Get in Touch
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
              We&apos;d love to hear from you — questions, feedback, or partnerships.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-4">
              <div className="h-px max-w-[80px] flex-1 bg-white/25" />
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                Contact &nbsp;·&nbsp; Support &nbsp;·&nbsp; Partnerships
              </p>
              <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            </div>
          </div>
        </section>

        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12 lg:px-8 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
            {/* Form card */}
            <div className="lg:col-span-3">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-li-magenta/5 md:p-8">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Send us a message
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We usually reply within a few business days.
                  </p>
                  <div className="mt-8">
                    <ContactFormClient />
                  </div>
                </div>
              </div>

              {/* Side column */}
              <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Contact info
                </h2>
                <ul className="mt-4 space-y-4 text-sm">
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-li-magenta" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a
                        href={`mailto:${CONTACT_DISPLAY.email}`}
                        className="text-li-ocean underline-offset-4 hover:underline"
                      >
                        {CONTACT_DISPLAY.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-li-magenta" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a
                        href={`tel:${CONTACT_DISPLAY.phone.replace(/\s/g, "")}`}
                        className="text-li-ocean underline-offset-4 hover:underline"
                      >
                        {CONTACT_DISPLAY.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-li-magenta" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">Office</p>
                      <p className="text-muted-foreground">{CONTACT_DISPLAY.office}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
                <h2 className="font-display text-lg font-semibold text-foreground">Follow us</h2>
                <div className="mt-4 flex flex-wrap gap-4">
                  <a
                    href={CONTACT_DISPLAY.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-li-magenta hover:underline"
                    aria-label="Love Island Nigeria on Instagram"
                  >
                    <Instagram className="h-5 w-5" aria-hidden />
                    Instagram
                  </a>
                  <a
                    href={CONTACT_DISPLAY.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-li-magenta hover:underline"
                    aria-label="Love Island Nigeria on X"
                  >
                    <XIcon className="h-5 w-5" />
                    X (Twitter)
                  </a>
                  <a
                    href={CONTACT_DISPLAY.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-li-magenta hover:underline"
                    aria-label="Love Island Nigeria on YouTube"
                  >
                    <Youtube className="h-5 w-5" aria-hidden />
                    YouTube
                  </a>
                </div>
              </div>

              {/* <div className="rounded-2xl border border-li-sky/30 bg-li-sky/10 p-6">
                <h2 className="font-display text-lg font-semibold text-li-navy">FAQ &amp; help</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quick answers and voting or competition help.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/help"
                      className="font-medium text-li-ocean underline-offset-4 hover:underline"
                    >
                      Help &amp; FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/competitions"
                      className="font-medium text-li-ocean underline-offset-4 hover:underline"
                    >
                      Competitions support
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/vote"
                      className="font-medium text-li-ocean underline-offset-4 hover:underline"
                    >
                      Voting support
                    </Link>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>
          </div>
        </div>
      </main>
    </>
  )
}
