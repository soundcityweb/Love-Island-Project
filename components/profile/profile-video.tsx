"use client"

import { useState, useRef } from "react"
import { Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react"

interface ProfileVideoProps {
  name: string
  video: {
    src: string
    poster?: string
    title: string
    description?: string
  }
}

export function ProfileVideo({ name, video }: ProfileVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showOverlay, setShowOverlay] = useState(true)

  function handlePlayPause() {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      setIsPlaying(true)
      setShowOverlay(false)
    } else {
      el.pause()
      setIsPlaying(false)
      setShowOverlay(true)
    }
  }

  function handleMuteToggle() {
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }

  function handleFullscreen() {
    const el = videoRef.current
    if (!el) return
    if (el.requestFullscreen) {
      el.requestFullscreen()
    }
  }

  function handleVideoEnd() {
    setIsPlaying(false)
    setShowOverlay(true)
  }

  return (
    <section className="border-t border-border bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px w-8 bg-primary" />
            {name}&apos;s Video
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            Introduction Clip
          </span>
        </div>

        {/* Video container */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-foreground">
          <div className="relative aspect-video">
            {/* Video element */}
            <video
              ref={videoRef}
              src={video.src}
              poster={video.poster}
              muted={isMuted}
              playsInline
              onEnded={handleVideoEnd}
              onPause={() => {
                setIsPlaying(false)
                setShowOverlay(true)
              }}
              onPlay={() => {
                setIsPlaying(true)
                setShowOverlay(false)
              }}
              className="absolute inset-0 h-full w-full object-cover"
              aria-label={`${name} introduction video`}
            />

            {/* Initial / paused overlay */}
            {showOverlay && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/40 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
                  aria-label="Play video"
                >
                  <Play className="ml-1 h-8 w-8 text-primary-foreground" />
                </button>
                <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/80">
                  Play Introduction
                </p>
              </div>
            )}

            {/* Bottom controls bar — visible when playing */}
            {!showOverlay && (
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-foreground/80 to-transparent px-5 pb-4 pt-10">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/25"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/25"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/25"
                  aria-label="Enter fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Info bar below video */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Play className="ml-0.5 h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-primary-foreground">
                {video.title}
              </p>
              {video.description && (
                <p className="mt-0.5 truncate text-xs text-primary-foreground/50">
                  {video.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
