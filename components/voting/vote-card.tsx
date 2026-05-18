import Image from "next/image"
import type { Contestant } from "@/components/voting/types"

export interface VoteCardProps {
  contestant: Contestant
  isSelected: boolean
  isDisabled: boolean
  onSelect: () => void
  /** First rows: eager load for LCP; rest lazy for bandwidth. */
  imagePriority?: boolean
}

export function VoteCard({
  contestant,
  isSelected,
  isDisabled,
  onSelect,
  imagePriority = false,
}: VoteCardProps) {
  const { name, age, location, image } = contestant

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={`Vote for ${name}`}
      className={`group relative block w-full min-w-0 touch-manipulation overflow-hidden rounded-2xl text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground active:scale-[0.99] ${
        isDisabled
          ? "cursor-not-allowed opacity-45 grayscale"
          : isSelected
            ? "shadow-warm-lg ring-2 ring-primary ring-offset-2 ring-offset-foreground [box-shadow:0_0_28px_-4px_rgba(255,77,128,0.55),0_12px_40px_-8px_rgba(255,122,23,0.35)] sm:scale-[1.02]"
            : "cursor-pointer hover:shadow-warm-lg hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-foreground sm:hover:-translate-y-1"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        <Image
          src={image}
          alt={`${name}, ${age}`}
          width={400}
          height={533}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          priority={imagePriority}
          loading={imagePriority ? undefined : "lazy"}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            !isDisabled ? "sm:group-hover:scale-105" : ""
          }`}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/30 to-transparent" />

        {/* Selection wash + radial glow */}
        {isSelected && !isDisabled && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-primary/15 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(255,77,128,0.4),transparent)]" />
          </>
        )}

        {/* Check mark */}
        <div
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
            isSelected && !isDisabled
              ? "border-primary bg-primary shadow-warm"
              : "border-primary-foreground/40 bg-foreground/40 backdrop-blur-sm group-hover:border-primary/60 group-hover:bg-primary/25"
          }`}
        >
          {isSelected && !isDisabled && (
            <svg
              className="h-4 w-4 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <h3 className="text-lg font-bold text-primary-foreground drop-shadow-md">
          {name}
          <span className="text-primary-foreground/50">, {age}</span>
        </h3>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground/55">
          {location}
        </p>
      </div>

      {/* Bottom accent bar */}
      {!isDisabled && (
        <div
          className={`absolute bottom-0 left-0 z-10 h-1.5 transition-all duration-500 ${
            isSelected
              ? "w-full bg-gradient-to-r from-primary via-accent to-yellow-400"
              : "w-0 bg-primary group-hover:w-full"
          }`}
        />
      )}
    </button>
  )
}
