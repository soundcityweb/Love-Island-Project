"use client"

import React, { useCallback, useEffect, useState } from "react"
import { ImagePlus, X, AlertCircle, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { PROFILE_IMAGE_WIDTH, PROFILE_IMAGE_HEIGHT } from "@/app/lib/constants"

const MAX_IMAGES = 5
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export interface StepImageUploadProps {
  /** Controlled list of image files */
  images: File[]
  /** Called when the user adds or removes images */
  onImagesChange: (images: File[]) => void
  /** Index of the image to use as main profile picture (0-based) */
  primaryImageIndex?: number
  /** Called when user sets a different image as main */
  onPrimaryImageIndexChange?: (index: number) => void
  error?: string
}

/** Derives preview URLs from controlled images and revokes them on cleanup */
function useImagePreviews(images: File[]): string[] {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  return previews
}

export function StepImageUpload({
  images,
  onImagesChange,
  primaryImageIndex = 0,
  onPrimaryImageIndexChange,
  error,
}: StepImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const previews = useImagePreviews(images)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const validFiles = Array.from(files).filter(
        (file) =>
          file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE_BYTES
      )
      const totalFiles = [...images, ...validFiles].slice(0, MAX_IMAGES)
      onImagesChange(totalFiles)
    },
    [images, onImagesChange]
  )

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      if (onPrimaryImageIndexChange) {
        if (index === primaryImageIndex) {
          onPrimaryImageIndexChange(0)
        } else if (index < primaryImageIndex) {
          onPrimaryImageIndexChange(Math.max(0, primaryImageIndex - 1))
        }
      }
    },
    [images, onImagesChange, primaryImageIndex, onPrimaryImageIndexChange]
  )

  const setAsMain = useCallback(
    (index: number) => {
      if (onPrimaryImageIndexChange) onPrimaryImageIndexChange(index)
    },
    [onPrimaryImageIndexChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
          Step 2 of 3
        </p>
        <h2 className="mt-1.5 text-balance text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Show the World Your Glow
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Confidence is your best accessory. Upload up to {MAX_IMAGES} photos —
          include at least one full-body shot and one close-up so the casting
          team can see the full picture.
        </p>
        <p className="mt-2 text-xs font-semibold text-primary">
          Main profile photo must be <strong>{PROFILE_IMAGE_WIDTH}×{PROFILE_IMAGE_HEIGHT} px</strong> (3:4 ratio) for the best display on site.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all duration-200",
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
        onClick={() => document.getElementById("photo-upload")?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            document.getElementById("photo-upload")?.click()
          }
        }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full btn-gradient shadow-warm">
          <ImagePlus className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">
            Drop your best shots here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse &middot; JPG, PNG up to 10MB each &middot; Max {MAX_IMAGES} photos
          </p>
        </div>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-describedby={error ? "photo-error" : undefined}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p id="photo-error" className="text-xs">
            {error}
          </p>
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                index === primaryImageIndex ? "border-primary ring-2 ring-primary/30" : "border-border"
              )}
            >
              <img
                src={preview}
                alt={`Upload preview ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
              {index === primaryImageIndex ? (
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  Main
                </span>
              ) : (
                onPrimaryImageIndexChange && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAsMain(index)
                    }}
                    className="absolute bottom-1.5 left-1.5 rounded-md border border-primary/50 bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground opacity-0 transition-opacity hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                  >
                    Set as main
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{MAX_IMAGES} photos uploaded
      </p>
    </div>
  )
}
