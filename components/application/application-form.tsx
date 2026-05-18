"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Flame, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  ApplicationFormData,
  ApplicationStepConfig,
  ApplicationSubmitPayload,
  PersonalInfoErrors,
  FunFact,
  SocialLink,
} from "@/app/types/application"
import { createApplication } from "@/app/lib/api"
import { StepIndicator } from "./step-indicator"
import { StepPersonalInfo } from "./step-personal-info"
import { StepImageUpload } from "./step-image-upload"
import { StepVideoUpload } from "./step-video-upload"
import { StepConfirmation } from "./step-confirmation"

const STEPS: ApplicationStepConfig[] = [
  { label: "Personal Info", description: "Tell us about yourself" },
  { label: "Photos", description: "Upload your best photos" },
  { label: "Video", description: "Record your introduction" },
  { label: "Confirmation", description: "Application submitted" },
]

const INITIAL_FORM_DATA: ApplicationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  city: "",
  occupation: "",
  bio: "",
  tagline: "",
  lookingFor: "",
  profileStatusLabel: "",
  funFacts: [],
  socialLinks: [],
}

/** Map form payload to API create-application payload (fields + images + video) */
function mapPayloadToCreatePayload(payload: ApplicationSubmitPayload) {
  const { formData, images, video, primaryImageIndex } = payload
  return {
    fields: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      city: formData.city,
      occupation: formData.occupation,
      bio: formData.bio,
      tagline: formData.tagline || undefined,
      lookingFor: formData.lookingFor || undefined,
      profileStatusLabel: formData.profileStatusLabel || undefined,
      funFacts: formData.funFacts?.length ? formData.funFacts : undefined,
      socialLinks: formData.socialLinks?.length ? formData.socialLinks : undefined,
    },
    images,
    video,
    primaryImageIndex: primaryImageIndex ?? 0,
  }
}

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA)
  const [images, setImages] = useState<File[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [video, setVideo] = useState<File | null>(null)
  const [errors, setErrors] = useState<PersonalInfoErrors>({})
  const [imageError, setImageError] = useState("")
  const [videoError, setVideoError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFieldChange = useCallback(
    (field: keyof ApplicationFormData, value: string | FunFact[] | SocialLink[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const validatePersonalInfo = useCallback((): boolean => {
    const newErrors: PersonalInfoErrors = {}
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.age.trim()) {
      newErrors.age = "Age is required"
    } else {
      const age = parseInt(formData.age, 10)
      if (age < 18 || age > 40) newErrors.age = "Must be between 18-40"
    }
    if (!formData.gender) newErrors.gender = "Please select your gender"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.occupation.trim())
      newErrors.occupation = "Occupation is required"
    if (!formData.bio.trim()) {
      newErrors.bio = "Please tell us about yourself"
    } else if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be under 500 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const validateImages = useCallback((): boolean => {
    if (images.length === 0) {
      setImageError("Please upload at least one photo")
      return false
    }
    const primaryIndex = Math.min(primaryImageIndex, images.length - 1)
    const mainFile = images[primaryIndex]
    if (!mainFile?.type.startsWith("image/")) {
      setImageError("Please set a main profile photo")
      return false
    }
    setImageError("")
    return true
  }, [images, primaryImageIndex])

  const validateVideo = useCallback((): boolean => {
    setVideoError("")
    return true
  }, [])

  const handleNext = useCallback(async () => {
    if (currentStep === 0 && !validatePersonalInfo()) return
    if (currentStep === 1 && !validateImages()) return
    if (currentStep === 2 && !validateVideo()) return

    if (currentStep === 2) {
      const payload: ApplicationSubmitPayload = {
        formData,
        images,
        video,
        primaryImageIndex: Math.min(primaryImageIndex, images.length - 1),
      }
      setSubmitError(null)
      setIsSubmitting(true)
      try {
        await createApplication(mapPayloadToCreatePayload(payload))
        setIsSubmitted(true)
        setCurrentStep(3)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to submit application")
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }, [
    currentStep,
    formData,
    images,
    video,
    primaryImageIndex,
    validatePersonalInfo,
    validateImages,
    validateVideo,
  ])

  const handleBack = useCallback(() => {
    setSubmitError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleStartOver = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setImages([])
    setPrimaryImageIndex(0)
    setVideo(null)
    setErrors({})
    setImageError("")
    setVideoError("")
    setIsSubmitted(false)
    setCurrentStep(0)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center bg-background">

      {/* ── Casting Hero — shown on entry, scrolls away naturally ────── */}
      {!isSubmitted && (
        <section className="relative w-full overflow-hidden">
          <div className="absolute inset-0 bg-li-sunset" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
              ✦ &nbsp;Open Casting &nbsp;·&nbsp; Love Island Nigeria Season 1&nbsp; ✦
            </p>
            <h1 className="mt-4 text-balance text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl">
              Think you&apos;ve got what it takes<br className="hidden sm:block" /> to survive the Villa?
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
              Sun, drama, romance — and possibly a life-changing connection.
              Your story starts right here.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Applications Open
              </span>
              <span className="text-sm text-white/50">
                Takes just a few minutes. No experience required.
              </span>
            </div>
          </div>
        </section>
      )}


      <main className={`w-full flex-1 relative z-10${!isSubmitted ? " mt-[-80px]" : ""}`}>
        {/* ── Section 2: Form — warm parchment background ──────────────── */}
        <section className="relative w-full">
          <div className="relative mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pt-4 pb-16 md:pb-24">
            {/* ── Form card — centered within the wider layout ────────── */}
            <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              <div className="p-6 sm:p-8">
              {!isSubmitted && (
                <div className="mb-8">
                  <StepIndicator steps={STEPS} currentStep={currentStep} />
                </div>
              )}

              {/* ── Form step card ─────────────────────────────────── */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                {/* Gradient top accent bar */}
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary to-accent" />
                <div className="p-5 pt-8 sm:p-8 sm:pt-10">
            {currentStep === 0 && (
              <StepPersonalInfo
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
              />
            )}
            {currentStep === 1 && (
              <StepImageUpload
                images={images}
                primaryImageIndex={Math.min(primaryImageIndex, Math.max(0, images.length - 1))}
                onPrimaryImageIndexChange={setPrimaryImageIndex}
                onImagesChange={(newImages) => {
                  setImages(newImages)
                  if (newImages.length > 0) setImageError("")
                  if (primaryImageIndex >= newImages.length) {
                    setPrimaryImageIndex(Math.max(0, newImages.length - 1))
                  }
                }}
                error={imageError}
              />
            )}
            {currentStep === 2 && (
              <StepVideoUpload
                video={video}
                onVideoChange={setVideo}
                error={videoError}
              />
            )}
            {currentStep === 3 && isSubmitted && (
              <StepConfirmation
                formData={formData}
                imageCount={images.length}
                hasVideo={!!video}
                onStartOver={handleStartOver}
              />
            )}
                </div>
              </div>

              {/* ── Navigation ─────────────────────────────────────── */}
              {!isSubmitted && (
                <div className="mt-6 space-y-3">
                  {submitError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                      <p className="text-sm font-medium text-destructive" role="alert">
                        {submitError}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={currentStep === 0 || isSubmitting}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={() => void handleNext()}
                      disabled={isSubmitting}
                      className="gap-2 rounded-full btn-gradient border-0 px-7 py-2.5 text-sm font-black text-white shadow-warm hover:brightness-110 disabled:opacity-60"
                    >
                      {currentStep === 2 ? (
                        isSubmitting ? (
                          <>
                            Making your entrance…
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            Enter the Villa
                            <Flame className="h-4 w-4" />
                          </>
                        )
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* ── Section 3: Bottom CTA — dark gradient ───────────────────── */}
      <footer className="relative w-full overflow-hidden bg-foreground px-4 md:px-8 py-16 md:py-24 lg:px-12 text-center">
        {/* Radial glow centred at the top — mirrors the hero accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,77,128,0.18),transparent)]" />

        <div className="relative mx-auto max-w-3xl">
          {/* Eyebrow */}
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-primary">
            ✦ &nbsp;Open Casting &nbsp;·&nbsp; Love Island Nigeria Season 1&nbsp; ✦
          </p>

          {/* Headline */}
          <h2 className="mt-4 text-balance text-3xl font-black tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
            Your journey<br className="hidden sm:block" /> starts here.
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/70">
            The Villa is waiting — and so is the rest of your story. Thousands
            dream about this moment. You&apos;re already one step ahead.
          </p>

          {/* CTA button — navigates away, no interference with form flow */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/islanders"
              className="inline-flex items-center gap-2 rounded-full btn-gradient px-8 py-3 text-sm font-black text-white shadow-warm transition-all hover:brightness-110"
            >
              <Heart className="h-4 w-4 fill-current" />
              Meet the Islanders
            </Link>
            <Link
              href="/videos"
              className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/30 px-8 py-3 text-sm font-bold text-primary-foreground transition-colors hover:border-primary-foreground/60"
            >
              Watch the Show
            </Link>
          </div>

          {/* Confidentiality note */}
          <p className="mt-12 text-xs text-primary-foreground/30">
            Love Island Nigeria &middot; All applications are confidential and
            reviewed by our casting team.
          </p>
        </div>
      </footer>
    </div>
  )
}
