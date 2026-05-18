"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Send } from "lucide-react"

import type { ContactDetail, ContactMessageStatus } from "@/app/lib/admin-contact-types"
import { useAuth } from "@/hooks/use-auth"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CONTACT_REPLY_TEMPLATES } from "@/components/admin/contact-reply-templates"
const STATUS_OPTIONS: { value: ContactMessageStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
]

const SUBJECT_LABELS: Record<string, string> = {
  general_inquiry: "General Inquiry",
  support: "Support",
  partnerships: "Partnerships",
  media: "Media",
  other: "Other",
}

export function ContactMessageDetailAdmin({ id }: { id: string }) {
  const { user } = useAuth({ redirectIfUnauthenticated: false })
  const [detail, setDetail] = useState<ContactDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ContactMessageStatus>("new")
  const [statusSaving, setStatusSaving] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [replySending, setReplySending] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "Not found.")
        setDetail(null)
        return
      }
      const d = data as ContactDetail
      setDetail(d)
      setStatus(d.status)
    } catch {
      setError("Network error.")
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function saveStatus(next: ContactMessageStatus) {
    setStatus(next)
    setStatusSaving(true)
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(typeof j.message === "string" ? j.message : "Could not update status.")
      }
    } catch {
      setError("Could not update status.")
    } finally {
      setStatusSaving(false)
    }
  }

  async function sendReply() {
    if (!replyBody.trim()) return
    setReplyError(null)
    setReplySending(true)
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: replyBody.trim(),
          sentByLabel: user?.name ?? "Love Island Nigeria Support",
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setReplyError(typeof j.message === "string" ? j.message : "Send failed.")
        return
      }
      setReplyBody("")
      await load()
    } catch {
      setReplyError("Network error.")
    } finally {
      setReplySending(false)
    }
  }

  if (loading) {
    return (
      <AdminPageWrapper
        title="Contact message"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Contact", href: "/admin/contact-messages" },
          { label: "Loading…" },
        ]}
      >
        <p className="text-muted-foreground">Loading…</p>
      </AdminPageWrapper>
    )
  }

  if (!detail) {
    return (
      <AdminPageWrapper
        title="Contact message"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Contact", href: "/admin/contact-messages" },
        ]}
      >
        <p className="text-destructive">{error ?? "Message not found."}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/contact-messages">Back to list</Link>
        </Button>
      </AdminPageWrapper>
    )
  }

  const subjectLabel = SUBJECT_LABELS[detail.subject] ?? detail.subject
  const isImage =
    detail.attachmentUrl &&
    /\.(jpe?g|png|gif|webp)(\?|$)/i.test(detail.attachmentUrl)

  return (
    <AdminPageWrapper
      title={detail.name}
      description={`${detail.email} · ${subjectLabel}`}
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Contact messages", href: "/admin/contact-messages" },
        { label: detail.name },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-semibold">Message</h2>
              {detail.isUrgent ? (
                <span className="rounded bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
                  Urgent
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                Auto-tag: {detail.category.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{detail.message}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Received {new Date(detail.createdAt).toLocaleString()}
              {detail.firstResponseAt
                ? ` · First reply ${new Date(detail.firstResponseAt).toLocaleString()}`
                : ""}
            </p>
          </div>

          {detail.attachmentUrl ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold">Attachment</h3>
              <div className="mt-3">
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={detail.attachmentUrl}
                    alt="Attachment"
                    className="max-h-64 max-w-full rounded-lg border object-contain"
                  />
                ) : null}
                <a
                  href={detail.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Download / open file
                </a>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Reply history</h3>
            {detail.replies.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No replies yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {detail.replies.map((r) => (
                  <li
                    key={r.id}
                    className="border-l-2 border-primary/30 pl-4 text-sm"
                  >
                    <p className="whitespace-pre-wrap">{r.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.sentByLabel ?? "Support"} · {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Status</h3>
            <Select
              value={status}
              disabled={statusSaving}
              onValueChange={(v) => void saveStatus(v as ContactMessageStatus)}
            >
              <SelectTrigger className="mt-3" aria-label="Message status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Send reply</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sends email to {detail.email} and saves to history.
            </p>
            <div className="mt-3">
              <label htmlFor="template-pick" className="text-xs text-muted-foreground">
                Template
              </label>
              <Select
                onValueChange={(tid) => {
                  const t = CONTACT_REPLY_TEMPLATES.find((x) => x.id === tid)
                  if (t) setReplyBody(t.body)
                }}
              >
                <SelectTrigger id="template-pick" className="mt-1" aria-label="Insert reply template">
                  <SelectValue placeholder="Insert template…" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_REPLY_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              className="mt-4 min-h-[160px]"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write your reply…"
              aria-label="Reply message body"
            />
            {replyError ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {replyError}
              </p>
            ) : null}
            <Button
              type="button"
              className="mt-4 w-full"
              disabled={replySending || !replyBody.trim()}
              onClick={() => void sendReply()}
            >
              {replySending ? (
                "Sending…"
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  Send reply email
                </>
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              <a href={`mailto:${detail.email}`} className="font-medium text-primary hover:underline">
                {detail.email}
              </a>
            </p>
            {detail.phone ? (
              <p className="mt-2">
                <span className="text-muted-foreground">Phone:</span>{" "}
                <a href={`tel:${detail.phone}`} className="font-medium hover:underline">
                  {detail.phone}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
