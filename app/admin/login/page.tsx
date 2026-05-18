import { Suspense } from "react"
import type { Metadata } from "next"
import { AdminLoginClient } from "./admin-login-client"

export const metadata: Metadata = {
  title: "Admin Sign In · Love Island Nigeria",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"
        aria-hidden
      />
      <span className="sr-only">Loading sign-in…</span>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginClient />
    </Suspense>
  )
}
