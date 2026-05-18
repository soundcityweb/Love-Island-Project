"use client"

import { useState } from "react"

type Status = "idle" | "loading" | "success" | "error"

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    const trimmed = email.trim()
    if (!trimmed) {
      setStatus("error")
      setMessage("Please enter your email.")
      return
    }
    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setMessage(
          typeof (data as { message?: string }).message === "string"
            ? (data as { message: string }).message
            : "Something went wrong. Please try again.",
        )
        return
      }
      setStatus("success")
      setMessage("You’re in! We’ll email you when new stories drop.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  return (
    <>
      <form
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        aria-label="Email newsletter signup"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status !== "loading") {
              setStatus("idle")
              setMessage(null)
            }
          }}
          placeholder="Your email address"
          autoComplete="email"
          required
          disabled={status === "loading"}
          className="w-full rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 sm:w-72"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full btn-gradient px-6 py-3 text-sm font-black text-white shadow-warm transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Signing up…" : "Keep Me Posted"}
        </button>
      </form>
      {message && (
        <p
          className={`w-full text-center text-sm sm:col-span-2 mt-2 ${
            status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </>
  )
}
