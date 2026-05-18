"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CountdownTimer } from "./countdown-timer"
import { SponsorBadge } from "./sponsor-badge"
import { QuizComponent } from "./quiz-component"
import type { CompetitionData, Question, SubmitResult } from "./types"
import { TYPE_BANNER_GRADIENT } from "./types"

// ── Re-export CompetitionData so app/competitions/[slug]/page.tsx keeps working
export type { CompetitionData }

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreGrade(pct: number): { label: string; color: string } {
  if (pct === 100) return { label: "Perfect Score!",    color: "text-amber-300"   }
  if (pct >= 80)   return { label: "Villa Expert",      color: "text-emerald-300" }
  if (pct >= 60)   return { label: "Fan Favourite",     color: "text-sky-300"     }
  if (pct >= 40)   return { label: "Getting There",     color: "text-orange-300"  }
  return               { label: "Back to the Villa",  color: "text-red-400"     }
}

function parseReward(raw: string | null): { label: string; detail: string } | null {
  if (!raw) return null
  try {
    const obj = JSON.parse(raw) as Record<string, string>
    return {
      label:  (obj.type ?? "Prize").replace(/^./, (c) => c.toUpperCase()),
      detail: obj.currency ? `${obj.currency} ${obj.value ?? ""}` : (obj.value ?? raw),
    }
  } catch {
    return { label: "Prize", detail: raw }
  }
}

type GamePhase =
  | "init"
  | "not_started"
  | "upload_open"
  | "playing"
  | "complete"
  | "ended"
  | "error"

// ── ScoreCircle ───────────────────────────────────────────────────────────────

function ScoreCircle({ score, total }: { score: number; total: number }) {
  const [animated, setAnimated] = useState(false)
  const radius      = 52
  const circumf     = 2 * Math.PI * radius
  const pct         = total > 0 ? score / total : 0
  const dash        = animated ? circumf * pct : 0
  const { label, color } = scoreGrade(Math.round(pct * 100))

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90" aria-hidden>
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4D80" />
              <stop offset="100%" stopColor="#FF7A17" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke="url(#sg)" strokeWidth="10"
            strokeDasharray={`${dash} ${circumf - dash}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-black text-white">{score}</span>
          <span className="font-mono text-xs text-white/40">/ {total}</span>
        </div>
      </div>
      <p className={`text-sm font-bold ${color}`}>{label}</p>
    </div>
  )
}

// ── ResultsScreen ─────────────────────────────────────────────────────────────

function ResultsScreen({
  competition,
  result,
  questions,
  answers,
}: {
  competition: CompetitionData
  result: SubmitResult
  questions: Question[]
  answers: Record<number, string>
}) {
  const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,77,128,0.12),transparent)]" />
        <div className="relative">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white/35">
            Your Result
          </p>
          <div className="mt-5 flex justify-center">
            <ScoreCircle score={result.score} total={result.total} />
          </div>
          <p className="mt-3 text-sm text-white/50">
            You scored{" "}
            <span className="font-bold text-white/80">{result.score}</span>
            {" "}out of{" "}
            <span className="font-bold text-white/80">{result.total}</span>
            {pct >= 60 ? " — great effort!" : " — better luck next time!"}
          </p>
          <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF4D80] to-[#FF7A17] transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
        <ResultShareButtons title={competition.title} slug={competition.slug} />
      </div>

      {/* Per-question breakdown */}
      {result.results && result.results.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white/35">
            Answer Breakdown
          </p>
          {result.results.map((r, i) => (
            <div
              key={r.questionId}
              className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                r.correct
                  ? "border-emerald-500/25 bg-emerald-500/8"
                  : "border-red-500/25 bg-red-500/8"
              }`}
            >
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${r.correct ? "bg-emerald-500/25" : "bg-red-500/20"}`}>
                {r.correct
                  ? <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                  : <XMarkIcon className="h-3.5 w-3.5 text-red-400" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-semibold text-white/60">
                  Q{i + 1}. {questions[i]?.question ?? `Question ${i + 1}`}
                </p>
                <p className={`mt-0.5 text-sm font-medium ${r.correct ? "text-emerald-300" : "text-red-300"}`}>
                  {r.yourAnswer || "No answer"}
                </p>
                {!r.correct && (
                  <p className="mt-0.5 text-xs text-white/40">
                    Correct: <span className="text-emerald-400">{r.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fallback when API returns no per-question detail */}
      {(!result.results || result.results.length === 0) && questions.length > 0 && (
        <div className="space-y-2.5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white/35">
            Your Answers
          </p>
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-white/40">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs text-white/40">{q.question}</p>
                <p className="mt-0.5 text-sm font-semibold text-white/70">
                  {answers[i] ?? <em className="text-white/30 not-italic">No answer</em>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Link
          href="/competitions"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white/90"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Competitions
        </Link>
      </div>
    </div>
  )
}

// ── ResultShareButtons ────────────────────────────────────────────────────────

function ResultShareButtons({ title, slug }: { title: string; slug: string }) {
  const [pageUrl, setPageUrl] = useState("")

  useEffect(() => {
    setPageUrl(`${window.location.origin}/competitions/${slug}`)
  }, [slug])

  const shareText = `I just played "${title}" on Love Island Nigeria! Can you beat my score? 🏆`

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl)
      toast.success("Link copied!")
    } catch {
      toast.error("Could not copy link.")
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white/35">
        Challenge your friends
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => openUrl(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/20"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => openUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          <XIcon className="h-4 w-4" />
          X
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          <LinkIcon className="h-4 w-4" />
          Copy link
        </button>
      </div>
    </div>
  )
}

// ── RulesCard ─────────────────────────────────────────────────────────────────

function RulesCard({
  type,
  totalQuestions,
}: {
  type: CompetitionData["type"]
  totalQuestions: number
}) {
  const rules: Record<CompetitionData["type"], string[]> = {
    quiz: [
      `Answer all ${totalQuestions} questions in any order.`,
      "You can change your answer before submitting.",
      "Each question is worth 1 point.",
      "Submit once — answers are final.",
      "Results are revealed after submission.",
    ],
    poll: [
      "Select one option from the poll.",
      "One vote per person.",
      "Results are shown after closing.",
      "Voting is anonymous.",
    ],
    prediction: [
      "Make your prediction before the deadline.",
      "One entry per person.",
      "Correct predictions earn leaderboard points.",
      "Results announced after the live episode.",
    ],
    upload: [
      "Upload a single image or video file.",
      "Maximum file size: 50 MB.",
      "Entries are reviewed before going live.",
      "Winners are chosen by our team and sponsor.",
    ],
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <ClipboardIcon className="h-4 w-4 text-white/60" />
        </div>
        <h3 className="text-sm font-bold text-white/80">How to Play</h3>
      </div>
      <ol className="space-y-2.5">
        {rules[type].map((rule, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
              {i + 1}
            </span>
            <span className="text-xs leading-relaxed text-white/50">{rule}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── RewardCard ────────────────────────────────────────────────────────────────

function RewardCard({
  sponsorName,
  rewardConfig,
}: {
  sponsorName: string | null
  rewardConfig: string | null
}) {
  const reward = parseReward(rewardConfig)
  if (!reward && !sponsorName) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/8 to-orange-500/5 backdrop-blur-sm">
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
            <TrophyIcon className="h-4 w-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-amber-200/90">Reward</h3>
        </div>
        {reward && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">
              {reward.label}
            </p>
            {reward.detail && (
              <p className="mt-1 text-lg font-black text-amber-200">{reward.detail}</p>
            )}
          </div>
        )}
        {sponsorName && (
          <SponsorBadge name={sponsorName} variant="card" className="mt-3" />
        )}
      </div>
    </div>
  )
}

// ── SponsorBanner ─────────────────────────────────────────────────────────────

function SponsorBanner({ sponsorName, sponsorLogo }: { sponsorName: string | null; sponsorLogo: string | null }) {
  if (!sponsorName) return null
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-r from-white/5 via-white/[0.07] to-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(255,77,128,0.08),transparent)]" />
      <div className="relative flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left md:px-10 md:py-10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/8">
          <TagIcon className="h-7 w-7 text-white/40" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
            Official Sponsor
          </p>
          <p className="mt-1 text-lg font-black text-white/80">{sponsorName}</p>
          <p className="mt-1 text-sm text-white/40">
            This challenge is proudly brought to you by {sponsorName}. Play, win, and celebrate with us.
          </p>
        </div>
        {sponsorLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsorLogo}
            alt={sponsorName}
            className="h-12 w-auto shrink-0 rounded-lg object-contain opacity-80"
          />
        )}
      </div>
    </div>
  )
}

// ── UploadEntryForm ───────────────────────────────────────────────────────────

function UploadEntryForm({
  slug,
  onSubmitted,
}: {
  slug: string
  onSubmitted: () => void
}) {
  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [dragOver, setDragOver]   = useState(false)
  const [status, setStatus]       = useState<"idle" | "uploading" | "submitting" | "error">("idle")
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_MB   = 50
  const MAX_BYTES = MAX_MB * 1024 * 1024
  const ACCEPT    = "image/*,video/*"

  function pickFile(f: File) {
    if (f.size > MAX_BYTES) {
      setErrorMsg(`File is too large. Maximum size is ${MAX_MB} MB.`)
      return
    }
    setFile(f)
    setErrorMsg(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setStatus("uploading")
    setErrorMsg(null)

    try {
      // Step 1 — upload file, get back a URL
      const fd = new FormData()
      fd.append("file", file)
      const uploadRes  = await fetch("/api/competitions/entry-upload", { method: "POST", body: fd })
      const uploadData = await uploadRes.json().catch(() => ({})) as { url?: string; message?: string }
      if (!uploadRes.ok) {
        setErrorMsg(uploadData.message ?? "Upload failed. Please try again.")
        setStatus("error")
        return
      }
      const fileUrl = uploadData.url
      if (!fileUrl) { setErrorMsg("Upload succeeded but no URL returned."); setStatus("error"); return }

      // Step 2 — submit entry with the file URL
      setStatus("submitting")
      const { getOrCreateSessionId } = await import("@/app/lib/session")
      const sessionId = getOrCreateSessionId()
      const submitRes  = await fetch(`/api/competitions/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
        body: JSON.stringify({ answers: { entry_url: fileUrl } }),
      })
      const submitData = await submitRes.json().catch(() => ({})) as { message?: string }
      if (!submitRes.ok) {
        setErrorMsg(submitData.message ?? "Submission failed. Please try again.")
        setStatus("error")
        return
      }

      toast.success("Entry submitted! We'll review it and announce winners soon.")
      onSubmitted()
    } catch {
      setErrorMsg("Network error — please check your connection and try again.")
      setStatus("error")
    } finally {
      if (status !== "idle") setStatus("idle")
    }
  }

  const busy = status === "uploading" || status === "submitting"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload your entry"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-emerald-400/60 bg-emerald-500/10"
            : file
              ? "border-emerald-500/40 bg-emerald-500/8"
              : "border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
          disabled={busy}
        />

        {/* Preview */}
        {preview && file ? (
          file.type.startsWith("video/") ? (
            <video
              src={preview}
              className="max-h-40 w-auto rounded-xl object-cover"
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-40 w-auto rounded-xl object-cover" />
          )
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <UploadIcon className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/70">
                Drop your file here, or <span className="text-emerald-400">browse</span>
              </p>
              <p className="mt-1 text-xs text-white/30">Images & videos · Max {MAX_MB} MB</p>
            </div>
          </>
        )}

        {file && (
          <p className="text-xs text-emerald-300/70">
            {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3">
          <XMarkIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300/80">{errorMsg}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!file || busy}
        className="w-full rounded-xl btn-gradient px-5 py-3 text-sm font-bold text-white shadow-warm transition-all hover:-translate-y-px hover:shadow-warm-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "uploading" && (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="h-4 w-4 animate-spin" /> Uploading file…
          </span>
        )}
        {status === "submitting" && (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="h-4 w-4 animate-spin" /> Submitting entry…
          </span>
        )}
        {(status === "idle" || status === "error") && (
          <span className="flex items-center justify-center gap-2">
            <UploadIcon className="h-4 w-4" /> Submit Entry
          </span>
        )}
      </button>

      <p className="text-center text-[11px] text-white/25">
        One entry per person · Entries are reviewed before going live
      </p>
    </form>
  )
}

// ── CompetitionDetail ─────────────────────────────────────────────────────────

export function CompetitionDetail({ competition }: { competition: CompetitionData }) {
  const [phase,     setPhase]     = useState<GamePhase>("init")
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers,   setAnswers]   = useState<Record<number, string>>({})
  const [result,    setResult]    = useState<SubmitResult | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const isActive   = competition.status === "active"
  const isUpcoming = competition.status === "upcoming"
  const isEnded    = competition.status === "completed"

  // ── Resolve initial phase ─────────────────────────────────────────────────
  useEffect(() => {
    if (isUpcoming) { setPhase("not_started"); return }
    if (isEnded || !isActive) { setPhase("ended"); return }

    // Upload competitions don't use the questions/quiz flow — show the entry UI
    if (competition.type === "upload") {
      setPhase("upload_open")
      return
    }

    async function loadQuestions() {
      try {
        const res  = await fetch(`/api/competitions/${competition.slug}/questions`)
        const data = await res.json().catch(() => null)

        if (!res.ok) {
          setLoadError(
            (data as any)?.message ??
            "Couldn't load this competition. Please try again.",
          )
          setPhase("error")
          return
        }

        if (!Array.isArray(data) || data.length === 0) {
          setLoadError("No questions have been configured for this competition yet.")
          setPhase("error")
          return
        }

        setQuestions(data as Question[])
        setPhase("playing")
      } catch {
        setLoadError("Network error — please check your connection and try again.")
        setPhase("error")
      }
    }

    loadQuestions()
  }, [competition.slug, competition.type, isActive, isUpcoming, isEnded])

  const handleComplete = useCallback(
    (res: SubmitResult, submittedAnswers: Record<number, string>) => {
      setResult(res)
      setAnswers(submittedAnswers)
      setPhase("complete")
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [],
  )

  // ── Hero background ───────────────────────────────────────────────────────
  const heroBg = TYPE_BANNER_GRADIENT[competition.type]

  return (
    <div className="min-w-0 overflow-x-hidden bg-foreground">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {competition.bannerUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={competition.bannerUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-foreground" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${heroBg}`} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-foreground" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(255,77,128,0.20),transparent)]" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden
            />
          </>
        )}

        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-24 text-center sm:pb-16 sm:pt-28 md:px-8 lg:px-12 lg:pt-32">
          {/* Sponsor badge */}
          {competition.sponsorName && (
            <div className="mb-5 flex justify-center">
              <SponsorBadge
                name={competition.sponsorName}
                logoUrl={competition.sponsorLogo}
                variant="inline"
              />
            </div>
          )}

          {/* Status pill */}
          <div className="mb-4 flex justify-center">
            {isActive && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Live
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-300">
                Upcoming
              </span>
            )}
            {isEnded && (
              <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-purple-300">
                Ended
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-balance text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
            {competition.title}
          </h1>

          {/* Description */}
          {competition.description && (
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/65 sm:text-base">
              {competition.description}
            </p>
          )}

          {/* Countdown */}
          <div className="mx-auto mt-8 max-w-xs sm:max-w-sm">
            {isActive && competition.endAt && (
              <CountdownTimer targetIso={competition.endAt} label="ends" variant="hero" />
            )}
            {isUpcoming && competition.startAt && (
              <CountdownTimer targetIso={competition.startAt} label="starts" variant="hero" />
            )}
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="min-w-0 space-y-6">
            {/* Loading skeleton */}
            {phase === "init" && (
              <div className="space-y-4" aria-busy="true" aria-label="Loading competition">
                <div className="space-y-2">
                  <div className="h-3 animate-pulse rounded-full bg-white/8" />
                  <div className="h-1.5 animate-pulse rounded-full bg-white/8" />
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="mb-5 space-y-2">
                    <div className="h-5 animate-pulse rounded-full bg-white/8" />
                    <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/6" />
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="mt-2.5 h-14 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {phase === "error" && (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/8 p-8 text-center" role="alert">
                <XMarkIcon className="mx-auto h-10 w-10 text-red-400/50" />
                <h3 className="mt-3 text-lg font-bold text-red-300">Couldn&apos;t load the game</h3>
                <p className="mt-2 text-sm text-red-300/60">{loadError}</p>
                <Link
                  href="/competitions"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to competitions
                </Link>
              </div>
            )}

            {/* Not started */}
            {phase === "not_started" && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/8 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/15">
                  <ClockLargeIcon className="h-8 w-8 text-sky-400" />
                </div>
                <h3 className="text-xl font-black text-sky-200">Coming Soon</h3>
                <p className="mt-2 text-sm text-sky-200/60">
                  This challenge hasn&apos;t started yet. Check the countdown above and come back when it goes live.
                </p>
              </div>
            )}

            {/* Upload challenge — open for entries */}
            {phase === "upload_open" && (
              <UploadEntryForm
                slug={competition.slug}
                onSubmitted={() => setPhase("complete")}
              />
            )}

            {/* Ended */}
            {phase === "ended" && (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/8 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/15">
                  <TrophyIcon className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-black text-purple-200">Challenge Ended</h3>
                <p className="mt-2 text-sm text-purple-200/60">
                  This competition has closed. Results will be announced on our socials.
                </p>
                <Link
                  href="/competitions"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  See all competitions
                </Link>
              </div>
            )}

            {/* Active quiz */}
            {phase === "playing" && questions.length > 0 && (
              <QuizComponent
                questions={questions}
                slug={competition.slug}
                onComplete={handleComplete}
              />
            )}

            {/* Result screen */}
            {phase === "complete" && (
              competition.type === "upload" ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15">
                    <CheckIcon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-200">Entry Received!</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-emerald-200/60">
                    We&apos;ve got your submission. Our team will review it and winners will be announced on our socials.
                  </p>
                  <Link
                    href="/competitions"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    See all competitions
                  </Link>
                </div>
              ) : result ? (
                <ResultsScreen
                  competition={competition}
                  result={result}
                  questions={questions}
                  answers={answers}
                />
              ) : null
            )}

            {/* Sponsor banner — below game area */}
            <SponsorBanner sponsorName={competition.sponsorName} sponsorLogo={competition.sponsorLogo} />
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="space-y-5">
            <RulesCard type={competition.type} totalQuestions={questions.length || 5} />
            <RewardCard sponsorName={competition.sponsorName} rewardConfig={competition.rewardConfig} />
          </aside>
        </div>
      </section>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  )
}

function ClockLargeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}
