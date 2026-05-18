import { Heart } from "lucide-react"

interface ProfileBioProps {
  bio: string
  lookingFor: string
}

export function ProfileBio({ bio, lookingFor }: ProfileBioProps) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">

          {/* ── Villa Personality — bio column ──────────────────────── */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 bg-gradient-to-r from-primary to-accent rounded-full" />
              <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.35em] text-primary">
                Villa Personality
              </h2>
            </div>

            <p className="mt-6 text-lg leading-[1.9] text-foreground lg:text-xl">
              {bio}
            </p>
          </div>

          {/* ── Love Style — sticky accent card ─────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 p-6 shadow-warm lg:p-8">
              {/* Gradient top accent bar */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary to-accent" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl btn-gradient shadow-warm">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-primary">
                  Love Style
                </h3>
              </div>

              <p className="mt-5 text-base leading-relaxed text-foreground">
                {lookingFor}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
