"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

/** Legacy URL: opens the list page edit modal for this id. */
export default function AdminEditPodcastRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  useEffect(() => {
    if (id) router.replace(`/admin/podcasts?edit=${encodeURIComponent(id)}`)
    else router.replace("/admin/podcasts")
  }, [router, id])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Redirecting…
    </div>
  )
}
