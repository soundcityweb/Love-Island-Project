"use client"

import { useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CONTACT_SUBJECT_OPTIONS } from "@/app/lib/contact-constants"
import { contactFormSchema, type ContactFormValues } from "./contact-form-schema"
import { FormTextField } from "./form-text-field"
import { FormTextareaField } from "./form-textarea-field"
import { FormSelectField } from "./form-select-field"

const MAX_FILE = 5 * 1024 * 1024
const ACCEPT = "image/jpeg,image/png,image/gif,image/webp,application/pdf"

function formatApiMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message
    if (typeof m === "string") return m
    if (Array.isArray(m)) return m.filter((x) => typeof x === "string").join(", ")
  }
  return "Something went wrong. Please try again."
}

export function ContactFormClient() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "general_inquiry",
      message: "",
      website: "",
      privacyConsent: false,
    },
  })

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const f = e.target.files?.[0]
    if (!f) {
      setFile(null)
      return
    }
    if (f.size > MAX_FILE) {
      setFile(null)
      e.target.value = ""
      setFileError("File must be 5MB or smaller.")
      return
    }
    const ok =
      f.type === "image/jpeg" ||
      f.type === "image/png" ||
      f.type === "image/gif" ||
      f.type === "image/webp" ||
      f.type === "application/pdf"
    if (!ok) {
      setFile(null)
      e.target.value = ""
      setFileError("Only images (JPEG, PNG, GIF, WebP) or PDF are allowed.")
      return
    }
    setFile(f)
  }

  async function onSubmit(data: ContactFormValues) {
    setSubmitError(null)
    const fd = new FormData()
    fd.append("name", data.name.trim())
    fd.append("email", data.email.trim())
    if (data.phone?.trim()) fd.append("phone", data.phone.trim())
    fd.append("subject", data.subject)
    fd.append("message", data.message.trim())
    fd.append("website", data.website?.trim() ?? "")
    fd.append("privacyConsent", data.privacyConsent ? "true" : "false")
    if (file) fd.append("attachment", file)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(formatApiMessage(json))
        return
      }
      setSuccess(true)
      reset()
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch {
      setSubmitError("We could not reach the server. Check your connection and try again.")
    }
  }

  if (success) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-li-sky/40 bg-card p-8 text-center shadow-sm"
      >
        <p className="font-display text-xl font-semibold text-li-ocean">Message sent</p>
        <p className="mt-2 text-muted-foreground">
          Thank you — we&apos;ll get back to you shortly. Check your inbox for a confirmation.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 border-li-magenta/40 text-li-magenta hover:bg-li-magenta/10"
          onClick={() => {
            setSuccess(false)
            setSubmitError(null)
          }}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative space-y-6"
      noValidate
      aria-label="Contact form"
    >
      {/* Honeypot — hidden from users */}
      <div
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <FormTextField
        id="name"
        label="Full name"
        required
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <FormTextField
        id="email"
        label="Email address"
        type="email"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormTextField
        id="phone"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        hint="Optional — include country code (e.g. +234…)"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Controller
        name="subject"
        control={control}
        render={({ field }) => (
          <FormSelectField
            id="subject"
            label="Subject"
            required
            options={CONTACT_SUBJECT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.subject?.message}
          />
        )}
      />

      <FormTextareaField
        id="message"
        label="Message"
        required
        error={errors.message?.message}
        hint="At least 20 characters"
        {...register("message")}
      />

      <div className="space-y-2">
        <Label htmlFor="attachment" className="text-foreground">
          Attachment <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <input
          ref={fileRef}
          id="attachment"
          name="attachment"
          type="file"
          accept={ACCEPT}
          onChange={onFileChange}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "file:mr-3 file:rounded-md file:border-0 file:bg-li-sky/20 file:px-3 file:py-1 file:text-sm file:font-medium",
          )}
          aria-describedby="attachment-hint"
        />
        <p id="attachment-hint" className="text-xs text-muted-foreground">
          Images or PDF only, max 5MB.
        </p>
        {fileError ? (
          <p role="alert" className="text-sm text-destructive">
            {fileError}
          </p>
        ) : null}
      </div>

      <Controller
        name="privacyConsent"
        control={control}
        render={({ field }) => (
          <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
            <Checkbox
              id="privacyConsent"
              checked={field.value}
              onCheckedChange={(c) => field.onChange(c === true)}
              aria-invalid={Boolean(errors.privacyConsent)}
              aria-describedby={errors.privacyConsent ? "privacyConsent-error" : undefined}
            />
            <div className="space-y-1 text-sm leading-snug">
              <Label htmlFor="privacyConsent" className="cursor-pointer font-normal">
                I agree to the{" "}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-li-magenta underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  privacy policy
                </Link>
              </Label>
              {errors.privacyConsent ? (
                <p id="privacyConsent-error" role="alert" className="text-destructive">
                  {errors.privacyConsent.message}
                </p>
              ) : null}
            </div>
          </div>
        )}
      />

      {submitError ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <span>{submitError}</span>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-fit border-destructive/40"
            disabled={isSubmitting}
          >
            Retry send
          </Button>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-li-magenta to-li-orange text-white shadow-md hover:opacity-95 sm:w-auto"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" aria-hidden />
            Send message
          </>
        )}
      </Button>
    </form>
  )
}
