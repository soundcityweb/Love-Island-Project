import Image from "next/image"
import Link from "next/link"
import type { Islander } from "@/app/types/landing"

export interface IslandersSectionProps {
  islanders: Islander[]
}

export function IslandersSection({ islanders }: IslandersSectionProps) {
  return (
    <section id="islanders" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="animate-on-scroll text-center">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
            This Season&apos;s Islanders
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Meet the Islanders
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Bold, beautiful, and ready to risk it all for love. These are the
            faces you&apos;ll be rooting for — and obsessing over — all season long.
          </p>
        </div>

        {islanders.length > 0 ? (
          <div className="animate-on-scroll-delay mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
            {islanders.map((islander) => (
              <Link
                href={`/islanders/${islander.slug}`}
                key={islander.slug}
                className="group relative block overflow-hidden rounded-3xl shadow-warm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm-lg"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src={islander.image || "/placeholder.svg"}
                    alt={`${islander.name}, ${islander.age}, from ${islander.location}`}
                    width={400}
                    height={533}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Deep bottom gradient — primary readability layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                {/* Warm coral tint rising from bottom */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/30 to-transparent" />
                {/* Top vignette */}
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent" />

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  {/* Name — large, bold, unmissable */}
                  <h3 className="text-xl font-black leading-tight tracking-tight text-white lg:text-2xl">
                    {islander.name}
                    <span className="ml-1.5 text-base font-semibold text-white/45">{islander.age}</span>
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                    {islander.location}
                  </p>
                  {/* Tagline — personality text, always visible */}
                  {islander.tagline && (
                    <p className="mt-2 line-clamp-2 text-sm italic leading-snug text-primary">
                      &ldquo;{islander.tagline}&rdquo;
                    </p>
                  )}
                </div>

                {/* Gradient accent bar on hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-14 text-center">
            <p className="text-muted-foreground">
              The islanders are being chosen right now. Who&apos;s walking through
              those villa doors? Stay tuned.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/islanders"
            className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
          >
            See Every Islander
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
