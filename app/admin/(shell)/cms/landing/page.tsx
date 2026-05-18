"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminPageWrapper } from "@/components/admin/page-wrapper"

interface LandingSection {
  id: string
  sectionKey: string
  content: Record<string, unknown>
  updatedAt: string
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  countdown: "Countdown Timer",
  videos: "Videos Section",
  sponsors: "Sponsors & Partners",
}

function SectionEditor({
  section,
  onSaved,
}: {
  section: LandingSection
  onSaved: () => void
}) {
  const [raw, setRaw] = useState(JSON.stringify(section.content, null, 2))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setRaw(JSON.stringify(section.content, null, 2))
    setError(null)
    setSuccess(false)
  }, [section])

  async function handleSave() {
    setSaving(true); setError(null); setSuccess(false)
    try {
      const parsed = JSON.parse(raw)
      const res = await fetch(`/api/admin/landing/${section.sectionKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Save failed.")
      setSuccess(true)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON or save failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {SECTION_LABELS[section.sectionKey] ?? section.sectionKey}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Key: <code className="font-mono">{section.sectionKey}</code> · Last updated:{" "}
            {new Date(section.updatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error && (
        <div className="border-b border-border bg-destructive/10 px-5 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {success && (
        <div className="border-b border-border bg-emerald-500/10 px-5 py-3">
          <p className="text-sm text-emerald-700">Section saved successfully.</p>
        </div>
      )}

      <div className="p-5">
        <p className="mb-2 text-xs text-muted-foreground">
          Edit the JSON content for this section. All fields are free-form — match the shape expected by the frontend component.
        </p>
        <textarea
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
          rows={16}
          value={raw}
          onChange={e => { setRaw(e.target.value); setSuccess(false) }}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export default function AdminLandingPage() {
  const [sections, setSections] = useState<LandingSection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/landing", { cache: "no-store" })
      if (res.ok) setSections(await res.json())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <AdminPageWrapper
      title="Landing Page Content"
      description="Edit each section's JSON payload. Changes take effect on the next page load."
      breadcrumb={[
        { label: "Admin", href: "/admin"             },
        { label: "CMS",   href: "/admin/cms/landing" },
        { label: "Landing Page"                      },
      ]}
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No sections found. Run the database migration to seed default sections.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map(section => (
            <SectionEditor key={section.id} section={section} onSaved={load} />
          ))}
        </div>
      )}
    </AdminPageWrapper>
  )
}
