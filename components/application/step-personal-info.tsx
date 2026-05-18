"use client"

import { Plus, Trash2 } from "lucide-react"
import type {
  ApplicationFormData,
  FunFact,
  SocialLink,
  PersonalInfoErrors,
} from "@/app/types/application"
import { FUN_FACT_ICON_OPTIONS, SOCIAL_PLATFORM_OPTIONS } from "@/app/types/application"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormValue = string | FunFact[] | SocialLink[]

export interface StepPersonalInfoProps {
  formData: ApplicationFormData
  onChange: (field: keyof ApplicationFormData, value: FormValue) => void
  errors: PersonalInfoErrors
}

const defaultFunFact = (): FunFact => ({ icon: "heart", label: "", value: "" })
const defaultSocialLink = (): SocialLink => ({ platform: "instagram", handle: "", url: "" })

export function StepPersonalInfo({
  formData,
  onChange,
  errors,
}: StepPersonalInfoProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
          Step 1 of 3
        </p>
        <h2 className="mt-1.5 text-balance text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Who Are You?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every islander has a story. Tell us yours — the real, unfiltered you.
        </p>
      </div>

      {/* ── Section: The Basics ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-[2px] w-5 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
          The Basics
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName" className="text-foreground">
            First Name <span className="text-primary">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-xs text-destructive">
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName" className="text-foreground">
            Last Name <span className="text-primary">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-xs text-destructive">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-foreground">
            Email Address <span className="text-primary">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone" className="text-foreground">
            Phone Number <span className="text-primary">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-xs text-destructive">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* ── Section: Your Identity ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-[2px] w-5 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
          Your Identity
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="age" className="text-foreground">
            Age <span className="text-primary">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min={18}
            max={40}
            placeholder="e.g. 25"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            aria-invalid={!!errors.age}
            aria-describedby={errors.age ? "age-error" : undefined}
          />
          {errors.age && (
            <p id="age-error" className="text-xs text-destructive">
              {errors.age}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gender" className="text-foreground">
            Gender <span className="text-primary">*</span>
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => onChange("gender", value)}
          >
            <SelectTrigger
              id="gender"
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? "gender-error" : undefined}
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p id="gender-error" className="text-xs text-destructive">
              {errors.gender}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="city" className="text-foreground">
            City <span className="text-primary">*</span>
          </Label>
          <Input
            id="city"
            placeholder="e.g. Lagos"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
          />
          {errors.city && (
            <p id="city-error" className="text-xs text-destructive">
              {errors.city}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="occupation" className="text-foreground">
          Occupation <span className="text-primary">*</span>
        </Label>
        <Input
          id="occupation"
          placeholder="What do you do?"
          value={formData.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          aria-invalid={!!errors.occupation}
          aria-describedby={
            errors.occupation ? "occupation-error" : undefined
          }
        />
        {errors.occupation && (
          <p id="occupation-error" className="text-xs text-destructive">
            {errors.occupation}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tagline" className="text-foreground">
          Tagline
        </Label>
        <Input
          id="tagline"
          placeholder="Your one-line headline for the show"
          value={formData.tagline ?? ""}
          onChange={(e) => onChange("tagline", e.target.value)}
          maxLength={200}
          aria-invalid={!!errors.tagline}
          aria-describedby={errors.tagline ? "tagline-error" : undefined}
        />
        <div className="flex items-center justify-between">
          {errors.tagline ? (
            <p id="tagline-error" className="text-xs text-destructive">
              {errors.tagline}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {(formData.tagline ?? "").length}/200
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lookingFor" className="text-foreground">
          What are you looking for?
        </Label>
        <Textarea
          id="lookingFor"
          rows={3}
          placeholder="What are you looking for in a partner or on the show?"
          value={formData.lookingFor ?? ""}
          onChange={(e) => onChange("lookingFor", e.target.value)}
          aria-invalid={!!errors.lookingFor}
          aria-describedby={errors.lookingFor ? "lookingFor-error" : undefined}
        />
        {errors.lookingFor && (
          <p id="lookingFor-error" className="text-xs text-destructive">
            {errors.lookingFor}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profileStatusLabel" className="text-foreground">
          Profile status
        </Label>
        <Select
          value={formData.profileStatusLabel ?? ""}
          onValueChange={(value) => onChange("profileStatusLabel", value)}
        >
          <SelectTrigger
            id="profileStatusLabel"
            aria-invalid={!!errors.profileStatusLabel}
            aria-describedby={errors.profileStatusLabel ? "profileStatusLabel-error" : undefined}
          >
            <SelectValue placeholder="Select status (shown on your profile)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Currently in the villa">Currently in the villa</SelectItem>
            <SelectItem value="New arrival">New arrival</SelectItem>
            <SelectItem value="Looking for love">Looking for love</SelectItem>
            <SelectItem value="In it to win it">In it to win it</SelectItem>
            <SelectItem value="Coupled up">Coupled up</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.profileStatusLabel && (
          <p id="profileStatusLabel-error" className="text-xs text-destructive">
            {errors.profileStatusLabel}
          </p>
        )}
      </div>

      {/* ── Section: Your Story ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-[2px] w-5 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
          Your Story
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <p className="text-sm text-muted-foreground">
        This is your chance to shine. Be bold, be honest, be you.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio" className="text-foreground">
          About You <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="Tell us what makes you unique. Why should you be on Love Island Nigeria?"
          value={formData.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? "bio-error" : undefined}
        />
        <div className="flex items-center justify-between">
          {errors.bio ? (
            <p id="bio-error" className="text-xs text-destructive">
              {errors.bio}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {formData.bio.length}/500
          </span>
        </div>
      </div>

      {/* ── Section: The Extras ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-[2px] w-5 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
          The Extras
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <p className="text-sm text-muted-foreground">
        Optional — but the islanders who stand out always go the extra mile.
      </p>

      {/* Fun facts (optional) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">Fun facts</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const list = formData.funFacts ?? []
              onChange("funFacts", [...list, defaultFunFact()])
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add another
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Optional. These will appear on your islander profile.
        </p>
        {(formData.funFacts ?? []).map((fact, i) => (
          <div
            key={i}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex flex-col gap-1.5 min-w-[100px]">
              <Label className="text-xs">Icon</Label>
              <Select
                value={fact.icon}
                onValueChange={(value) => {
                  const list = [...(formData.funFacts ?? [])]
                  list[i] = { ...list[i], icon: value }
                  onChange("funFacts", list)
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUN_FACT_ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 min-w-[120px] flex-col gap-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                placeholder="e.g. Perfect date"
                value={fact.label}
                onChange={(e) => {
                  const list = [...(formData.funFacts ?? [])]
                  list[i] = { ...list[i], label: e.target.value }
                  onChange("funFacts", list)
                }}
              />
            </div>
            <div className="flex flex-1 min-w-[120px] flex-col gap-1.5">
              <Label className="text-xs">Value</Label>
              <Input
                placeholder="e.g. Beach sunset"
                value={fact.value}
                onChange={(e) => {
                  const list = [...(formData.funFacts ?? [])]
                  list[i] = { ...list[i], value: e.target.value }
                  onChange("funFacts", list)
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                const list = (formData.funFacts ?? []).filter((_, j) => j !== i)
                onChange("funFacts", list)
              }}
              aria-label="Remove fun fact"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Social links (optional) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">Social links</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const list = formData.socialLinks ?? []
              onChange("socialLinks", [...list, defaultSocialLink()])
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add another
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Optional. These will appear on your islander profile.
        </p>
        {(formData.socialLinks ?? []).map((link, i) => (
          <div
            key={i}
            className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex flex-col gap-1.5 min-w-[110px]">
              <Label className="text-xs">Platform</Label>
              <Select
                value={link.platform}
                onValueChange={(value) => {
                  const list = [...(formData.socialLinks ?? [])]
                  list[i] = { ...list[i], platform: value }
                  onChange("socialLinks", list)
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="x">X</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 min-w-[100px] flex-col gap-1.5">
              <Label className="text-xs">Handle</Label>
              <Input
                placeholder="@handle"
                value={link.handle}
                onChange={(e) => {
                  const list = [...(formData.socialLinks ?? [])]
                  list[i] = { ...list[i], handle: e.target.value }
                  onChange("socialLinks", list)
                }}
              />
            </div>
            <div className="flex flex-1 min-w-[140px] flex-col gap-1.5">
              <Label className="text-xs">URL</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => {
                  const list = [...(formData.socialLinks ?? [])]
                  list[i] = { ...list[i], url: e.target.value }
                  onChange("socialLinks", list)
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                const list = (formData.socialLinks ?? []).filter((_, j) => j !== i)
                onChange("socialLinks", list)
              }}
              aria-label="Remove social link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
