"use client"

import type { ApplicationStepConfig } from "@/app/types/application"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface StepIndicatorProps {
  steps: ApplicationStepConfig[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Application progress" className="w-full">
      {/* Desktop step indicator */}
      <ol className="hidden md:flex w-full items-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          return (
            <li key={step.label} className="flex flex-1 flex-col items-center">
              {/* ── Circle row: left-half · circle · right-half ── */}
              <div className="flex w-full items-center">
                {/* Left half-connector — invisible on first step */}
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-all duration-500",
                    index === 0
                      ? "invisible"
                      : currentStep >= index
                        ? "bg-gradient-to-r from-primary to-accent"
                        : "bg-border"
                  )}
                />
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted && "btn-gradient text-white",
                    isCurrent &&
                      "btn-gradient text-white shadow-warm ring-2 ring-primary/30 ring-offset-2 ring-offset-card",
                    !isCompleted &&
                      !isCurrent &&
                      "border border-border bg-muted text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="font-mono font-bold text-xs">{index + 1}</span>
                  )}
                </div>
                {/* Right half-connector — invisible on last step */}
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-all duration-500",
                    index === steps.length - 1
                      ? "invisible"
                      : isCompleted
                        ? "bg-gradient-to-r from-primary to-accent"
                        : "bg-border"
                  )}
                />
              </div>

              {/* ── Label centred directly below the circle ── */}
              <span
                className={cn(
                  "mt-2 text-center text-xs whitespace-nowrap transition-colors",
                  isCurrent
                    ? "font-bold text-primary"
                    : "font-medium text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Mobile step indicator */}
      <div className="flex md:hidden flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {steps.map((_, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isCurrent ? "w-8 btn-gradient" : "w-2",
                  isCompleted && !isCurrent && "bg-primary/70",
                  !isCompleted && !isCurrent && "bg-border"
                )}
              />
            )
          })}
        </div>
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary font-bold font-mono">
            Step {currentStep + 1}
          </span>{" "}
          of {steps.length} &mdash; {steps[currentStep]?.label}
        </p>
      </div>
    </nav>
  )
}
