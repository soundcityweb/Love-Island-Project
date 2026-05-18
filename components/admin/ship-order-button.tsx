"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// ----- Icons ----- //

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 1-.987-1.106v3.375c0 .601.4 1.136.987 1.191A48.4 48.4 0 0 1 8.25 9v5.25a.75.75 0 0 0 .75.75h.375" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

// ----- Component ----- //

interface Props {
  orderNumber: string
}

type State = "idle" | "loading" | "success" | "error"

export function ShipOrderButton({ orderNumber }: Props) {
  const router = useRouter()
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleShip() {
    setState("loading")
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/ship`, {
        method: "PATCH",
      })

      if (res.ok) {
        setState("success")
        // Refresh the server component to show the updated status
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.message ?? `Request failed (${res.status}).`)
        setState("error")
      }
    } catch {
      setErrorMsg("Could not reach the server. Check your connection.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
        <CheckIcon className="h-4 w-4 shrink-0" />
        Order marked as shipped
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleShip}
        disabled={state === "loading"}
        className="gap-2"
      >
        {state === "loading" ? (
          <>
            <SpinnerIcon className="h-4 w-4" />
            Marking as Shipped…
          </>
        ) : (
          <>
            <TruckIcon className="h-4 w-4" />
            Mark as Shipped
          </>
        )}
      </Button>

      {state === "error" && errorMsg && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  )
}
