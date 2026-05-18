"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { useAuth, type AdminUser } from "@/hooks/use-auth"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const NEW_PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function parseApiMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong."
  const m = (data as { message?: unknown }).message
  if (typeof m === "string") return m
  if (Array.isArray(m) && m.length > 0 && typeof m[0] === "string") return m[0]
  return "Something went wrong."
}

function roleLabel(role: AdminUser["role"]): string {
  return role === "super_admin" ? "Super Admin" : "Admin"
}

function PasswordInputRow({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  autoComplete?: string
  error?: string | null
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn("pr-10", error && "border-destructive")}
          aria-invalid={!!error}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function AdminProfileSettings({
  defaultTab = "profile",
}: {
  defaultTab?: "profile" | "security"
}) {
  const { user, loading, refetchUser } = useAuth({ redirectIfUnauthenticated: true })

  const [emailValue, setEmailValue] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const [curPw, setCurPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwFieldErrors, setPwFieldErrors] = useState<{
    new?: string
    confirm?: string
  }>({})

  const emailValid = useMemo(() => {
    const t = emailValue.trim()
    if (!t) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
  }, [emailValue])

  const emailFormOk =
    emailValid &&
    emailPassword.length > 0 &&
    user != null &&
    emailValue.trim().toLowerCase() !== user.email.toLowerCase()

  const newPwOk = NEW_PASSWORD_REGEX.test(newPw)
  const confirmOk = newPw.length > 0 && newPw === confirmPw
  const passwordFormOk =
    curPw.length > 0 && newPwOk && confirmOk && !pwSubmitting

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(null)
    if (!user || !emailFormOk) return

    setEmailSubmitting(true)
    try {
      const res = await fetch("/api/auth/update-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: emailValue.trim().toLowerCase(),
          currentPassword: emailPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setEmailError(parseApiMessage(data))
        return
      }

      toast.success("Email updated successfully")
      setEmailValue("")
      setEmailPassword("")
      await refetchUser()
    } catch {
      setEmailError("Network error. Please try again.")
    } finally {
      setEmailSubmitting(false)
    }
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwFieldErrors({})

    if (!newPwOk) {
      setPwFieldErrors({
        new: "Use at least 8 characters with one number and one special character.",
      })
      return
    }
    if (!confirmOk) {
      setPwFieldErrors({ confirm: "Passwords do not match." })
      return
    }

    setPwSubmitting(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: curPw,
          newPassword: newPw,
          confirmNewPassword: confirmPw,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = parseApiMessage(data)
        if (res.status === 401 && msg.toLowerCase().includes("password")) {
          setPwError("Current password is incorrect.")
        } else {
          setPwError(msg)
        }
        setPwSubmitting(false)
        return
      }

      toast.success("Password updated successfully")
      window.location.href = "/admin/login"
    } catch {
      setPwError("Network error. Please try again.")
      setPwSubmitting(false)
    }
  }

  if (loading || !user) {
    return (
      <AdminPageWrapper
        title="Profile & Security"
        description="Loading your account…"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Profile" },
        ]}
        contentClassName="p-6"
      >
        <div className="h-32 animate-pulse rounded-lg bg-muted/60" aria-hidden />
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper
      title="Profile & Security"
      description="View your account details and keep your sign-in credentials up to date."
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Profile" },
      ]}
      contentClassName="p-4 sm:p-6"
    >
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 focus-visible:outline-none">
          <section
            aria-labelledby="profile-readonly-heading"
            className="rounded-lg border border-border bg-background/50 p-4 sm:p-5"
          >
            <h2
              id="profile-readonly-heading"
              className="text-sm font-semibold text-foreground"
            >
              Account
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-foreground">{user.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </dt>
                <dd className="mt-1 text-sm text-foreground">{roleLabel(user.role)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current email
                </dt>
                <dd className="mt-1 text-sm text-foreground">{user.email}</dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="update-email-heading"
            className="rounded-lg border border-border bg-background/50 p-4 sm:p-5"
          >
            <h2
              id="update-email-heading"
              className="text-sm font-semibold text-foreground"
            >
              Update email
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your new address and current password. All other sessions will be signed
              out when your email changes, except this browser after tokens refresh.
            </p>

            <form onSubmit={onSubmitEmail} className="mt-6 max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">New email</Label>
                <Input
                  id="new-email"
                  type="email"
                  autoComplete="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  disabled={emailSubmitting}
                  className={cn(
                    emailValue.length > 0 && !emailValid && "border-destructive",
                  )}
                />
                {emailValue.length > 0 && !emailValid ? (
                  <p className="text-sm text-destructive">Enter a valid email address.</p>
                ) : null}
              </div>

              <PasswordInputRow
                id="email-current-password"
                label="Current password"
                value={emailPassword}
                onChange={setEmailPassword}
                disabled={emailSubmitting}
                autoComplete="current-password"
              />

              {emailError ? (
                <p className="text-sm text-destructive" role="alert">
                  {emailError}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={!emailFormOk || emailSubmitting}
              >
                {emailSubmitting ? "Saving…" : "Update email"}
              </Button>
            </form>
          </section>
        </TabsContent>

        <TabsContent value="security" className="space-y-8 focus-visible:outline-none">
          <section
            aria-labelledby="password-heading"
            className="rounded-lg border border-border bg-background/50 p-4 sm:p-5"
          >
            <h2 id="password-heading" className="text-sm font-semibold text-foreground">
              Change password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use at least 8 characters including one number and one special character. You
              will be signed out everywhere after a successful change.
            </p>

            <form onSubmit={onSubmitPassword} className="mt-6 max-w-md space-y-4">
              <PasswordInputRow
                id="pw-current"
                label="Current password"
                value={curPw}
                onChange={setCurPw}
                disabled={pwSubmitting}
                autoComplete="current-password"
              />
              <PasswordInputRow
                id="pw-new"
                label="New password"
                value={newPw}
                onChange={setNewPw}
                disabled={pwSubmitting}
                autoComplete="new-password"
                error={pwFieldErrors.new ?? null}
              />
              <PasswordInputRow
                id="pw-confirm"
                label="Confirm new password"
                value={confirmPw}
                onChange={setConfirmPw}
                disabled={pwSubmitting}
                autoComplete="new-password"
                error={pwFieldErrors.confirm ?? null}
              />

              {pwError ? (
                <p className="text-sm text-destructive" role="alert">
                  {pwError}
                </p>
              ) : null}

              <Button type="submit" disabled={!passwordFormOk}>
                {pwSubmitting ? "Updating…" : "Update password"}
              </Button>
            </form>
          </section>

          <section
            aria-labelledby="sessions-heading"
            className="rounded-lg border border-dashed border-border bg-muted/20 p-4 sm:p-5"
          >
            <h2 id="sessions-heading" className="text-sm font-semibold text-foreground">
              Active sessions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Session management across devices will appear here in a future update.
            </p>
          </section>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  )
}
