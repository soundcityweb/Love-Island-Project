"use client"

import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type FormEvent,
} from "react"
import {
  Upload,
  X,
  ImageIcon,
  FileVideo,
  FileText,
  Loader2,
  Save,
  AlertCircle,
  Bold,
  Italic,
  List,
  Link2,
  Heading2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormLayout — outer <form> shell with a sticky action bar
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFormLayoutProps {
  children: ReactNode
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
  /** When true the submit button shows a spinner and is disabled */
  isSubmitting?: boolean
  /** Label on the primary save button */
  submitLabel?: string
  /** Label on the cancel button */
  cancelLabel?: string
  /**
   * Optional status shown left of the action buttons.
   * e.g. "All changes saved" or a form-level error message.
   */
  statusMessage?: { text: string; type: "success" | "error" | "info" }
  className?: string
}

export function AdminFormLayout({
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  statusMessage,
  className,
}: AdminFormLayoutProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("flex flex-col gap-6", className)}
    >
      {/* Sections */}
      {children}

      {/* ── Sticky action bar ───────────────────────────── */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-card/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status message */}
          {statusMessage ? (
            <p
              className={cn(
                "flex items-center gap-1.5 text-sm",
                statusMessage.type === "error"   && "text-destructive",
                statusMessage.type === "success"  && "text-emerald-500",
                statusMessage.type === "info"     && "text-muted-foreground",
              )}
            >
              {statusMessage.type === "error" && (
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              )}
              {statusMessage.text}
            </p>
          ) : (
            <span />
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormSection — a titled card grouping related fields
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFormSectionProps {
  title: string
  description?: string
  /** Optional icon or badge shown beside the title */
  aside?: ReactNode
  children: ReactNode
  className?: string
}

export function AdminFormSection({
  title,
  description,
  aside,
  children,
  className,
}: AdminFormSectionProps) {
  return (
    <section
      aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {/* Section header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2
            id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className="text-sm font-semibold text-foreground"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>

      {/* Fields */}
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormRow — responsive 1- or 2-column field row
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFormRowProps {
  /** 1 = single column (full width), 2 = two equal columns, 3 = three columns */
  cols?: 1 | 2 | 3
  children: ReactNode
  className?: string
}

const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}

export function AdminFormRow({ cols = 1, children, className }: AdminFormRowProps) {
  return (
    <div className={cn("grid gap-x-5 gap-y-5", GRID_CLASS[cols], className)}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormField — label + control + hint + error
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  /** Validation error message — displays in red below the control */
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function AdminFormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: AdminFormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>

      {/* Control slot — Input, Textarea, Select, FileUpload, etc. */}
      <div
        className={cn(
          "[&_input]:w-full [&_select]:w-full [&_textarea]:w-full",
          error && [
            "[&_input]:border-destructive [&_input]:ring-destructive/20",
            "[&_textarea]:border-destructive [&_textarea]:ring-destructive/20",
            "[&_[data-upload]]:border-destructive",
          ],
        )}
      >
        {children}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-destructive" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormFileUpload — drag-and-drop file zone
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFormFileUploadProps {
  /** MIME type or extension filter e.g. "image/*" or "image/*,video/*" */
  accept?: string
  /** Max allowed file size in MB (default 10) */
  maxSizeMB?: number
  /** Called when a valid file is selected */
  onFileSelect?: (file: File) => void
  /** Called when the current file is removed */
  onFileRemove?: () => void
  /** Controlled current file (for edit forms pre-populated with existing asset) */
  currentFile?: File | null
  /** URL of an already-uploaded asset (shown as preview) */
  currentUrl?: string
  disabled?: boolean
  className?: string
}

type FileType = "image" | "video" | "other"

function detectFileType(file: File): FileType {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "other"
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminFormFileUpload({
  accept,
  maxSizeMB = 10,
  onFileSelect,
  onFileRemove,
  currentFile,
  currentUrl,
  disabled = false,
  className,
}: AdminFormFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [file, setFile] = useState<File | null>(currentFile ?? null)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(
    (f: File) => {
      setError(null)

      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be under ${maxSizeMB} MB`)
        return
      }

      setFile(f)
      onFileSelect?.(f)

      const type = detectFileType(f)
      if (type === "image") {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(f)
      } else {
        setPreview(null)
      }
    },
    [maxSizeMB, onFileSelect],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setPreview(null)
    setError(null)
    onFileRemove?.()
  }

  const fileType = file ? detectFileType(file) : null

  return (
    <div
      data-upload
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload file"
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={cn(
        "group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3",
        "rounded-xl border-2 border-dashed transition-all duration-200",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-input hover:border-primary/50 hover:bg-muted/30",
        disabled && "cursor-not-allowed opacity-60",
        (file || preview) && "min-h-[100px]",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
      />

      {/* ── Has file ──────────────────────────────────── */}
      {(file || preview) ? (
        <div className="flex w-full items-center gap-4 p-4">
          {/* Image preview */}
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
            />
          )}

          {/* File type icon for non-images */}
          {!preview && fileType === "video" && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileVideo className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          {!preview && fileType === "other" && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
          )}

          {/* File info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file?.name ?? "Current file"}
            </p>
            {file && (
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="mt-1 text-xs text-primary underline-offset-2 hover:underline"
            >
              Replace
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove file"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        /* ── Empty drop zone ──────────────────────────── */
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
            {accept?.includes("video") && !accept?.includes("image") ? (
              <FileVideo className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">Click to upload</span>
              {" "}or drag & drop
            </p>
            <p className="text-xs text-muted-foreground">
              {accept
                ? accept.split(",").map((a) => a.trim().replace("/*", "")).join(", ").toUpperCase()
                : "Any file"
              }
              {" "}· Max {maxSizeMB} MB
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-input">
            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormRichText — TinyMCE-compatible rich text slot
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminFormRichTextProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  id?: string
  /**
   * Pass your mounted TinyMCE (or other) editor as children to replace the
   * built-in textarea fallback entirely.
   */
  children?: ReactNode
}

const TOOLBAR_ACTIONS = [
  { icon: Bold,     label: "Bold"   },
  { icon: Italic,   label: "Italic" },
  { icon: Heading2, label: "Heading"},
  { icon: List,     label: "List"   },
  { icon: Link2,    label: "Link"   },
] as const

export function AdminFormRichText({
  value = "",
  onChange,
  placeholder = "Write your content here…",
  minHeight = 220,
  disabled = false,
  id,
  children,
}: AdminFormRichTextProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-input transition-colors",
        "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
        {TOOLBAR_ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            disabled={!!children || disabled}
            aria-label={label}
            title={label}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
              children || disabled
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}

        {/* TinyMCE badge when editor is injected */}
        {children && (
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Rich editor active
          </span>
        )}
      </div>

      {/* ── Editor slot ─────────────────────────────── */}
      {children ? (
        /* When a TinyMCE (or other) editor is passed, render it here */
        <div className="w-full">{children}</div>
      ) : (
        /* Built-in textarea fallback */
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{ minHeight }}
          className={cn(
            "rounded-none border-0 bg-transparent ring-0 focus-visible:ring-0",
            "resize-y",
          )}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFormDivider — visual separator between rows inside a section
// ─────────────────────────────────────────────────────────────────────────────

export function AdminFormDivider({ className }: { className?: string }) {
  return <hr className={cn("border-border", className)} />
}
