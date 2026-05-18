"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Video, X, AlertCircle, Play } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024 // 100MB

export interface StepVideoUploadProps {
  /** Controlled video file (single file) */
  video: File | null
  /** Called when the user selects or removes the video */
  onVideoChange: (video: File | null) => void
  error?: string
}

/** Derives preview URL from controlled video and revokes it on cleanup */
function useVideoPreview(video: File | null): string | null {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!video) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(video)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [video])

  return preview
}

export function StepVideoUpload({
  video,
  onVideoChange,
  error,
}: StepVideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const preview = useVideoPreview(video)

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      if (!file.type.startsWith("video/")) return
      if (file.size > MAX_VIDEO_SIZE_BYTES) return
      onVideoChange(file)
    },
    [onVideoChange]
  )

  const removeVideo = useCallback(() => {
    onVideoChange(null)
  }, [onVideoChange])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFile(e.dataTransfer.files)
    },
    [handleFile]
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
          Step 3 of 3
        </p>
        <h2 className="mt-1.5 text-balance text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Your 60-Second Moment
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Lights. Camera. Irresistible. Upload a quick intro video — your name,
          what you do, and why love brought you here. Let them feel your energy.
        </p>
      </div>

      {!preview ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload video"
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            error && "border-destructive"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("video-upload")?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              document.getElementById("video-upload")?.click()
            }
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full btn-gradient shadow-warm">
            <Video className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              Drop your video here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse &middot; MP4, MOV, WebM up to 100MB
            </p>
          </div>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files)}
            aria-describedby={error ? "video-error" : undefined}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-border bg-foreground/5">
          <div className="relative aspect-video">
            <video
              src={preview}
              className="h-full w-full object-cover"
              controls
              aria-label="Video preview"
            />
          </div>
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Play className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="max-w-[200px] truncate text-sm font-medium text-foreground">
                  {video?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {video
                    ? `${(video.size / (1024 * 1024)).toFixed(1)} MB`
                    : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeVideo}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Remove video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p id="video-error" className="text-xs">
            {error}
          </p>
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
        <h3 className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Make It Unforgettable
        </h3>
        <ul className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full btn-gradient font-mono text-[10px] font-black text-white shadow-sm">
              1
            </span>
            Film in good lighting — natural daylight makes all the difference
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full btn-gradient font-mono text-[10px] font-black text-white shadow-sm">
              2
            </span>
            Keep it between 30 and 60 seconds — every second counts
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full btn-gradient font-mono text-[10px] font-black text-white shadow-sm">
              3
            </span>
            Be yourself, unapologetically — authenticity is everything
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full btn-gradient font-mono text-[10px] font-black text-white shadow-sm">
              4
            </span>
            Portrait or landscape — your angles, your rules
          </li>
        </ul>
      </div>
    </div>
  )
}
