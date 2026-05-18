"use client"

import Image from "next/image"
import { useState, useCallback, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ProfileGalleryProps {
  images: { src: string; alt: string }[]
  name: string
}

export function ProfileGallery({ images, name }: ProfileGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length))
  }, [images.length])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxIndex, closeLightbox, goNext, goPrev])

  return (
    <section className="border-t border-border bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px w-8 bg-primary" />
            {name} in the Villa
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {images.length} Photos
          </span>
        </div>

        {/* Masonry grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
          {images.map((img, i) => {
            // Make 1st and 4th images larger for visual variety
            const isLarge = i === 0 || i === 3
            return (
              <button
                key={img.src}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className={`group relative overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isLarge ? "col-span-2 row-span-2 md:col-span-1" : ""
                }`}
                aria-label={`View ${img.alt || `photo ${i + 1}`}`}
              >
                <div className={`relative overflow-hidden ${isLarge ? "aspect-[3/4]" : "aspect-square"}`}>
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt || `${name} gallery photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={isLarge ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 50vw, 33vw"}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/20" />
                  {/* Expand icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/90 shadow-lg">
                      <svg
                        className="h-4 w-4 text-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-4 backdrop-blur-md"
          role="dialog"
          aria-label="Image lightbox"
          aria-modal="true"
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Image */}
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl">
            <Image
              src={images[lightboxIndex].src || "/placeholder.svg"}
              alt={images[lightboxIndex].alt}
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={goNext}
            className="absolute right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Counter */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-primary-foreground/10 px-4 py-1.5 font-mono text-xs font-bold text-primary-foreground/70 backdrop-blur-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </section>
  )
}
