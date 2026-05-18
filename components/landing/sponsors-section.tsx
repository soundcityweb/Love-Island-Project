import type { SponsorsContent } from "@/app/types/landing"

export interface SponsorsSectionProps {
  content: SponsorsContent
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export function SponsorsSection({ content }: SponsorsSectionProps) {
  return (
    <section className="border-t border-border bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="animate-on-scroll text-center">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
            {content.label}
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Title Sponsors — Premium Cards */}
        {content.titleSponsors.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {content.titleSponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 to-accent/5 px-8 py-10 transition-all hover:border-primary/40 hover:shadow-warm-lg lg:px-10 lg:py-12"
            >
              {/* Decorative ring */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-primary/10 transition-transform duration-700 group-hover:scale-125" />
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-primary/10 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                    {sponsor.tier}
                  </span>
                </div>
                <h3 className="mt-3 text-3xl font-bold tracking-tight text-card-foreground lg:text-4xl">
                  {sponsor.name}
                </h3>
                <div className="mt-4 h-1 w-12 rounded-full bg-primary transition-all duration-300 group-hover:w-20" />
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Divider line */}
        {content.titleSponsors.length > 0 && content.officialPartners.length > 0 && (
          <div className="mx-auto my-12 flex items-center gap-4 lg:my-16">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Official Partners
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* Partners — Clean logo-style grid */}
        {content.officialPartners.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-0">
            {content.officialPartners.map((partner, i) => (
            <div
              key={partner.name}
              className={`group flex flex-col items-center justify-center px-6 py-8 transition-all duration-200 hover:scale-[1.04] hover:bg-primary/5 ${
                i < content.officialPartners.length - 1
                  ? "lg:border-r lg:border-border"
                  : ""
              }`}
            >
              {/* Stylized text logo */}
              <span className="text-xl font-bold tracking-tight text-muted-foreground transition-colors duration-300 group-hover:text-card-foreground lg:text-2xl">
                {partner.name}
              </span>
              <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                {partner.tier}
              </span>
            </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 text-center text-muted-foreground">
            <p>No sponsors have been announced yet.</p>
          </div>
        )}

        {/* Become a Partner CTA */}
        <div className="mt-16 overflow-hidden rounded-2xl bg-foreground px-6 py-12 text-center lg:px-12 lg:py-16">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/50">
            {content.cta.label}
          </p>
          <p className="mt-3 text-xl font-bold text-primary-foreground lg:text-2xl">
            {content.cta.title}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-primary-foreground/60">
            {content.cta.description}
          </p>
          <a
            href={content.cta.href}
            className="mt-8 inline-flex rounded-full btn-gradient px-8 py-3.5 text-sm font-bold text-white shadow-warm transition-all hover:brightness-110"
          >
            {content.cta.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
