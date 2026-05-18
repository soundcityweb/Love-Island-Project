"use client"

import type { ApplicationFormData } from "@/app/types/application"
import { Button } from "@/components/ui/button"
import { Mail, Smartphone, Heart, Star } from "lucide-react"

export interface StepConfirmationProps {
  formData: ApplicationFormData
  imageCount: number
  hasVideo: boolean
  onStartOver: () => void
}

export function StepConfirmation({
  formData,
  imageCount,
  hasVideo,
  onStartOver,
}: StepConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-4 text-center">

      {/* ── Celebration icon ───────────────────────────────────────────── */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-lg" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full btn-gradient shadow-warm-lg">
          <Star className="h-10 w-10 fill-current text-white" />
        </div>
        <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full btn-gradient shadow-warm">
          <Heart className="h-3.5 w-3.5 fill-current text-white" />
        </div>
      </div>

      {/* ── Headline ───────────────────────────────────────────────────── */}
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-primary">
          ✦ Application Received ✦
        </p>
        <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          The Villa is Expecting You,<br />
          {formData.firstName}!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          You&apos;ve taken the first bold step. Our casting team is already
          reviewing the hottest batch of applicants yet — if you&apos;ve got
          what it takes, you&apos;ll be hearing from us.
        </p>
      </div>

      {/* ── Application summary ────────────────────────────────────────── */}
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
          <div className="p-5">
            <h3 className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
              Your Application
            </h3>
            <dl className="flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="text-sm font-bold text-foreground">
                  {formData.firstName} {formData.lastName}
                </dd>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Age</dt>
                <dd className="text-sm font-bold text-foreground">
                  {formData.age}
                </dd>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">City</dt>
                <dd className="text-sm font-bold text-foreground">
                  {formData.city}
                </dd>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Photos</dt>
                <dd className="text-sm font-bold text-foreground">
                  {imageCount} uploaded
                </dd>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">Video</dt>
                <dd className="text-sm font-bold text-foreground">
                  {hasVideo ? "Uploaded" : "Not uploaded"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── What happens next ──────────────────────────────────────────── */}
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-background to-accent/5 p-5">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
          <h3 className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
            What Happens Next
          </h3>
          <ul className="flex flex-col gap-4 text-left">
            <li className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full btn-gradient shadow-warm">
                <Mail className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="pt-0.5 text-sm leading-relaxed text-foreground">
                A confirmation email is on its way to{" "}
                <span className="font-bold">{formData.email}</span>
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full btn-gradient shadow-warm">
                <Smartphone className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="pt-0.5 text-sm leading-relaxed text-foreground">
                An SMS confirmation heads to{" "}
                <span className="font-bold">{formData.phone}</span>
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full btn-gradient shadow-warm">
                <Heart className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="pt-0.5 text-sm leading-relaxed text-foreground">
                Our casting team reviews every application — if selected, we
                will reach out personally
              </p>
            </li>
          </ul>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onStartOver}
        className="mt-2 rounded-full bg-transparent px-6 font-bold"
      >
        Apply Again
      </Button>
    </div>
  )
}
