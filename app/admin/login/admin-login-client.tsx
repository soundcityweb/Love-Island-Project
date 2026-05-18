"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { SiteLogo } from "@/components/layout/SiteLogo"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
})

type LoginForm = z.infer<typeof loginSchema>

export function AdminLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") ?? "/admin"

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (res.ok) router.replace(redirectTo)
      })
      .catch((err) => {
        console.error('[admin-login-client] useEffect fetch failed:', err);
      })
  }, [router, redirectTo])

  const onSubmit = async (data: LoginForm) => {
    console.log('onSubmit fired', { redirectTo, currentHref: window.location.href });
    setIsSubmitting(true)
    setServerError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(
          typeof (json as { message?: string }).message === "string"
            ? (json as { message: string }).message
            : "Invalid credentials. Please try again.",
        )
        return
      }

      router.replace(redirectTo)
      router.refresh()
    } catch {
      setServerError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,100,160,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,80,140,0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <div
          className="rounded-2xl border p-8 shadow-2xl"
          style={{
            background: "rgba(18, 18, 28, 0.85)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255,100,160,0.2)",
            boxShadow:
              "0 0 0 1px rgba(255,100,160,0.08), 0 32px 64px rgba(0,0,0,0.6)",
          }}
        >
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <SiteLogo href="/" variant="on-dark" className="justify-center" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-200">
              Admin sign in
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Sign in to access the control panel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@loveisland.com"
                {...register("email")}
                className={`w-full rounded-xl border bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-2 ${
                  errors.email
                    ? "border-red-500/60 focus:ring-red-500/30"
                    : "border-zinc-700/60 focus:border-pink-500/50 focus:ring-pink-500/20"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full rounded-xl border bg-zinc-900/60 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-2 ${
                    errors.password
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : "border-zinc-700/60 focus:border-pink-500/50 focus:ring-pink-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: isSubmitting
                  ? "rgba(255,65,112,0.5)"
                  : "linear-gradient(135deg, #ff6ba8 0%, #ff4170 100%)",
                boxShadow: isSubmitting
                  ? "none"
                  : "0 4px 24px rgba(255,65,112,0.35)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Authorised personnel only · All activity is logged
          </p>
        </div>

        <div
          aria-hidden
          className="mx-auto mt-2 h-4 w-[85%] rounded-b-2xl opacity-20"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,100,160,0.15), transparent)",
            filter: "blur(8px)",
          }}
        />
      </div>
    </div>
  )
}
