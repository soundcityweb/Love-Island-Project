import React from "react"
import { Heart, Music, Utensils, Sparkles, Sun, Flame } from "lucide-react"

interface FunFact {
  icon: string
  label: string
  value: string
}

interface ProfileFunFactsProps {
  facts: FunFact[]
}

const iconMap: Record<string, React.ReactNode> = {
  heart: <Heart className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  food: <Utensils className="h-5 w-5" />,
  sparkle: <Sparkles className="h-5 w-5" />,
  sun: <Sun className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
}

export function ProfileFunFacts({ facts }: ProfileFunFactsProps) {
  return (
    <section className="relative overflow-hidden border-t border-border/50 py-20 lg:py-28">
      {/* Subtle tropical gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      {/* Soft radial warm glow at centre */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(255,77,128,0.07),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section heading */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.45em] text-primary">
              Fun Facts
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Get to Know Me
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            The real story, straight from the villa.
          </p>
        </div>

        {/* Facts grid */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm-lg"
            >
              {/* Hover gradient wash */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-warm">
                  {iconMap[fact.icon] ?? <Sparkles className="h-5 w-5" />}
                </div>
                <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {fact.label}
                </p>
                <p className="mt-1.5 text-base font-black text-card-foreground">
                  {fact.value}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
