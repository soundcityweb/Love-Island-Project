/**
 * Shared hero banner used on inner pages (news, videos, shop).
 *
 * Renders the standard dark `bg-foreground` header with an eyebrow label,
 * h1 title, and supporting description. An optional `children` slot accepts
 * additional content rendered below the description (e.g. a CTA row or
 * a filter legend).
 *
 * Pages with genuinely unique hero layouts (islanders gradient, vote centered
 * radial-glow) keep their own
 * inline markup.
 */

type HeroWrapperProps = {
  /** Small all-caps label displayed above the title. */
  eyebrow: string
  /** Page title — rendered as <h1>. Accepts ReactNode for rich text. */
  title: React.ReactNode
  /** Supporting paragraph below the title. */
  description: React.ReactNode
  /**
   * Optional extra content rendered below the description inside the
   * constrained container (e.g. a CTA row, stat list, or legend).
   */
  children?: React.ReactNode
}

export function HeroWrapper({
  eyebrow,
  title,
  description,
  children,
}: HeroWrapperProps) {
  return (
    <section className="bg-foreground px-4 md:px-8 pb-14 pt-16 lg:px-12 lg:pb-20 lg:pt-24">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-primary-foreground/60 lg:text-lg">
          {description}
        </p>
        {children}
      </div>
    </section>
  )
}
