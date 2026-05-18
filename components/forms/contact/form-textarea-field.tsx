"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface FormTextareaFieldProps extends React.ComponentProps<typeof Textarea> {
  id: string
  label: string
  error?: string
  hint?: string
}

export function FormTextareaField({
  id,
  label,
  error,
  hint,
  className,
  required,
  ...props
}: FormTextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Textarea
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn("min-h-[140px] resize-y", error && "border-destructive", className)}
        required={required}
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
