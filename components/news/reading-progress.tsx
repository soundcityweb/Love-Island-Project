"use client"

import { useEffect, useState } from "react"

/**
 * Thin fixed bar at the very top of the viewport that fills as the user scrolls
 * through the article. Sits above the sticky header (z-60).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-primary transition-transform duration-100 will-change-transform"
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  )
}
