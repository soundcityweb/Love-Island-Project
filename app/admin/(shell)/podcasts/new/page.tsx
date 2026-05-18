"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Legacy URL: opens the same modal as the list page. */
export default function AdminNewPodcastRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/admin/podcasts?new=1")
  }, [router])
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Redirecting…
    </div>
  )
}
