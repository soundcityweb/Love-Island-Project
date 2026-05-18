"use client"

/**
 * CompetitionPicker
 *
 * Client component that navigates to ?competition=<id> on change.
 * Used in server-rendered admin pages wherever a competition dropdown is needed.
 *
 * Usage:
 *   <CompetitionPicker
 *     competitions={[{ id, title }]}
 *     activeId="uuid"
 *     label="Poll"
 *     param="competition"   // URL search param name (default: "competition")
 *     inputId="my-picker"
 *   />
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface CompetitionOption {
  id:    string
  title: string
}

interface Props {
  competitions: CompetitionOption[]
  activeId?:    string
  label?:       string
  /** URL search param key to set on change. Default: "competition" */
  param?:       string
  inputId?:     string
  className?:   string
}

export function CompetitionPicker({
  competitions,
  activeId,
  label,
  param    = "competition",
  inputId  = "competition-picker",
  className,
}: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(param, e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs text-muted-foreground"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        value={activeId ?? ""}
        onChange={handleChange}
        className={
          className ??
          "h-9 rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        }
      >
        {competitions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  )
}
