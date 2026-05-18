"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import type { Application } from "@/app/types/application"

interface ApplicationMediaPreviewProps {
  application: Application
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function ApplicationMediaPreview({ application }: ApplicationMediaPreviewProps) {
  const images = application.media?.filter((m) => m.type === "image") ?? []
  const video = application.media?.find((m) => m.type === "video")
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVideoOverlay, setShowVideoOverlay] = useState(true)

  const selectedImage = images[selectedPhotoIndex]

  return (
    <div className="space-y-6">
      {/* Photo Review */}
      {images.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-bold text-card-foreground">
              Photo Submissions
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {images.length} photo{images.length !== 1 && "s"}
              </span>
            </h2>
          </div>
          {/* Large preview */}
          <div className="relative aspect-[4/3] w-full bg-muted">
            {selectedImage ? (
              <>
                <Image
                  src={selectedImage.storageKey || "/placeholder.svg"}
                  alt={selectedImage.altText || `Photo ${selectedPhotoIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
                {/* Photo counter */}
                <div className="absolute bottom-4 right-4 rounded-lg bg-foreground/70 px-3 py-1 font-mono text-xs font-bold text-primary-foreground backdrop-blur-sm">
                  {selectedPhotoIndex + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 border-t border-border bg-muted/30 p-3">
              {images.map((image, i) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setSelectedPhotoIndex(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === selectedPhotoIndex
                      ? "border-primary shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${i + 1}`}
                >
                  <Image
                    src={image.storageKey || "/placeholder.svg"}
                    alt={image.altText || `Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Video Review */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-bold text-card-foreground">
            Video Submission
            {video ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                UPLOADED
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                NOT SUBMITTED
              </span>
            )}
          </h2>
        </div>
        {video ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-b-xl bg-foreground/5">
            <video
              ref={videoRef}
              src={video.storageKey}
              controls
              playsInline
              muted={false}
              onPlay={() => setShowVideoOverlay(false)}
              onPause={() => setShowVideoOverlay(true)}
              onEnded={() => setShowVideoOverlay(true)}
              className="h-full w-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
            {showVideoOverlay && (
              <button
                type="button"
                onClick={() => {
                  const el = videoRef.current
                  if (el) {
                    el.play()
                    setShowVideoOverlay(false)
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-foreground/30 transition-colors hover:bg-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Play video"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <PlayIcon className="ml-1 h-8 w-8" />
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <PlayIcon className="ml-0.5 h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No video submitted
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              The applicant did not upload an introduction video.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
