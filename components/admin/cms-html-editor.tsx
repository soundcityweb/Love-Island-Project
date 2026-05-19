"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-lg border border-border bg-muted/40" /> },
)

export interface CmsHtmlEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
}

/**
 * Rich HTML editor for CMS pages. Prefers Tiny Cloud when NEXT_PUBLIC_TINYMCE_API_KEY is set;
 * otherwise loads TinyMCE 7 from jsDelivr (GPL) with `license_key: 'gpl'`.
 */
export function CmsHtmlEditor({ value, onChange, disabled }: CmsHtmlEditorProps) {
  const cloudKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY?.trim()
  const tinymceScriptSrc = useMemo(() => {
    if (cloudKey) {
      return `https://cdn.tiny.cloud/1/${cloudKey}/tinymce/7/tinymce.min.js`
    }
    return "https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
  }, [cloudKey])

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
      <Editor
        tinymceScriptSrc={tinymceScriptSrc}
        value={value}
        onEditorChange={(c) => onChange(c)}
        disabled={disabled}
        {...(!cloudKey ? { licenseKey: "gpl" } : {})}
        init={{
          height: 420,
          menubar: true,
          branding: false,
          promotion: false,
          plugins: "lists link image code table autoresize wordcount",
          toolbar:
            "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table | code removeformat",
          content_style:
            "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 16px; line-height: 1.6; }",
          skin: cloudKey ? undefined : "oxide",
          content_css: cloudKey ? undefined : "default",
        }}
      />
    </div>
  )
}
