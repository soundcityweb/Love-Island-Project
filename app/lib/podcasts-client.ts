"use client"

import { useCallback, useEffect, useState } from "react"

export type PodcastEpisode = {
  id: string
  title: string
  slug: string
  audioUrl: string | null
  videoUrl?: string | null
  notes: string | null
  thumbnailUrl: string | null
  crossLinks: { label: string; url: string }[] | null
  status: string
  createdAt: string
}

function messageFromBody(body: unknown): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const m = (body as { message: unknown }).message
    if (typeof m === "string") return m
  }
  return "Something went wrong."
}

/** List published episodes via Next route GET /api/podcasts */
export function usePodcastsList() {
  const [data, setData] = useState<PodcastEpisode[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/podcasts", { cache: "no-store" })
      const body: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(messageFromBody(body))
        setData(null)
        return
      }
      if (!Array.isArray(body)) {
        setError("Unexpected response shape.")
        setData(null)
        return
      }
      setData(body as PodcastEpisode[])
    } catch {
      setError("Network error.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

/** Single published episode via Next route GET /api/podcasts/[slug] */
export function usePodcastBySlug(slug: string | undefined) {
  const [data, setData] = useState<PodcastEpisode | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!slug?.trim()) {
      setLoading(false)
      setError(null)
      setData(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/podcasts/${encodeURIComponent(slug)}`, { cache: "no-store" })
      const body: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(messageFromBody(body))
        setData(null)
        return
      }
      setData(body as PodcastEpisode)
    } catch {
      setError("Network error.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
