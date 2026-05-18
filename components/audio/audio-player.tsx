"use client"

import { useCallback, useEffect, useRef, useState } from "react"

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export type AudioPlayerProps = {
  audioUrl: string
  /** Accessible label for the player region */
  label?: string
  className?: string
}

export function AudioPlayer({ audioUrl, label = "Audio player", className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [seeking, setSeeking] = useState(false)

  const syncFromAudio = useCallback(() => {
    const el = audioRef.current
    if (!el || seeking) return
    setCurrent(el.currentTime)
    if (Number.isFinite(el.duration)) setDuration(el.duration)
  }, [seeking])

  useEffect(() => {
    if (!seeking) return
    const endSeek = () => setSeeking(false)
    window.addEventListener("pointerup", endSeek)
    window.addEventListener("pointercancel", endSeek)
    return () => {
      window.removeEventListener("pointerup", endSeek)
      window.removeEventListener("pointercancel", endSeek)
    }
  }, [seeking])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onLoaded = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setCurrent(0)
    }

    el.addEventListener("loadedmetadata", onLoaded)
    el.addEventListener("durationchange", onLoaded)
    el.addEventListener("timeupdate", syncFromAudio)
    el.addEventListener("play", onPlay)
    el.addEventListener("pause", onPause)
    el.addEventListener("ended", onEnded)

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded)
      el.removeEventListener("durationchange", onLoaded)
      el.removeEventListener("timeupdate", syncFromAudio)
      el.removeEventListener("play", onPlay)
      el.removeEventListener("pause", onPause)
      el.removeEventListener("ended", onEnded)
    }
  }, [audioUrl, syncFromAudio])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    el.load()
  }, [audioUrl])

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      void el.play().catch(() => setPlaying(false))
    } else {
      el.pause()
    }
  }, [])

  const onSeekChange = useCallback((value: number) => {
    const el = audioRef.current
    if (!el || !Number.isFinite(duration) || duration <= 0) return
    el.currentTime = value
    setCurrent(value)
  }, [duration])

  const max = duration > 0 ? duration : 1
  const progressPct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0
  const canSeek = duration > 0

  return (
    <div
      role="region"
      aria-label={label}
      className={`flex flex-col gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-black/40 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${className}`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-li-magenta to-li-orange text-white shadow-lg shadow-li-magenta/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-li-sky focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0612]"
      >
        {playing ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="relative flex h-9 items-center">
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-li-magenta to-li-sky"
            style={{ width: `${progressPct}%` }}
            aria-hidden
          />
          <input
            type="range"
            min={0}
            max={max}
            step={0.1}
            value={Number.isFinite(current) ? current : 0}
            disabled={!canSeek}
            onChange={(e) => onSeekChange(Number(e.target.value))}
            onPointerDown={() => setSeeking(true)}
            aria-label="Seek audio"
            className="relative z-10 h-9 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
          />
        </div>
        <div className="flex justify-between font-mono text-xs tabular-nums text-white/70 sm:text-sm">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
