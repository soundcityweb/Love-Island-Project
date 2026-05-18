"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin'
  lastLoginAt: string | null
}

interface AuthState {
  user: AdminUser | null
  loading: boolean
  error: string | null
}

// Interval between automatic access token refreshes (12 minutes — well within
// the 15-minute access token lifetime).
const REFRESH_INTERVAL_MS = 12 * 60 * 1000

export function useAuth({ redirectIfUnauthenticated = true } = {}) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch current user ────────────────────────────────────────────────────

  const fetchUser = useCallback(async (): Promise<AdminUser | null> => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })

      if (res.status === 401) {
        // Try to silently refresh the access token
        const refreshed = await tryRefresh()
        if (!refreshed) return null

        // Retry once after refresh
        const retry = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!retry.ok) return null
        const data = await retry.json()
        return (data as { user: AdminUser }).user ?? null
      }

      if (!res.ok) return null
      const data = await res.json()
      return (data as { user: AdminUser }).user ?? null
    } catch {
      return null
    }
  }, [])

  // ── Silent token refresh ──────────────────────────────────────────────────

  const tryRefresh = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  }

  // ── Initialise ────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const user = await fetchUser()

      if (cancelled) return

      if (!user && redirectIfUnauthenticated) {
        console.error('[useAuth] No user found, redirecting to login');
        const redirectTo = window.location.pathname
        router.replace(`/admin/login?redirect=${encodeURIComponent(redirectTo)}`)
        return
      }

      setState({ user, loading: false, error: null })
    }

    init()
    return () => { cancelled = true }
  }, [fetchUser, redirectIfUnauthenticated, router])

  // ── Proactive token refresh ───────────────────────────────────────────────

  useEffect(() => {
    if (!state.user) return

    refreshTimerRef.current = setInterval(async () => {
      const refreshed = await tryRefresh()
      if (!refreshed) {
        // Refresh failed — session expired
        setState({ user: null, loading: false, error: 'Session expired.' })
        router.replace('/admin/login')
      }
    }, REFRESH_INTERVAL_MS)

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [state.user, router])

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors — cookies are cleared server-side
    } finally {
      setState({ user: null, loading: false, error: null })
      router.replace('/admin/login')
    }
  }, [router])

  const refetchUser = useCallback(async (): Promise<AdminUser | null> => {
    const user = await fetchUser()
    setState((prev) => ({ ...prev, user, loading: false, error: null }))
    return user
  }, [fetchUser])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isSuperAdmin = state.user?.role === 'super_admin'
  const isAdmin = !!state.user

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    logout,
    refetchUser,
    isSuperAdmin,
    isAdmin,
  }
}
