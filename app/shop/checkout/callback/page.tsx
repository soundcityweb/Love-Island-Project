"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useCart } from "@/app/shop/cart-context"

// ----- Icons ----- //

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

// ----- Types ----- //

type VerifyState = "loading" | "success" | "failed" | "error"

// ----- Page ----- //

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()

  // Paystack passes the reference as either `reference` or `trxref`
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? null

  const [state, setState] = useState<VerifyState>("loading")
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setState("error")
      return
    }

    let cancelled = false

    fetch(`/api/payments/verify/${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((data: { status: string; orderNumber?: string }) => {
        if (cancelled) return

        if (data.status === "success") {
          clearCart()
          setOrderNumber(data.orderNumber ?? null)
          setState("success")
          // Redirect to the success page after a short delay so the user sees the confirmation
          setTimeout(() => {
            if (cancelled) return
            const params = new URLSearchParams()
            if (data.orderNumber) params.set("order", data.orderNumber)
            router.replace(`/shop/checkout/success?${params.toString()}`)
          }, 2000)
        } else if (["failed", "abandoned"].includes(data.status)) {
          setState("failed")
        } else {
          setState("error")
        }
      })
      .catch(() => {
        if (!cancelled) setState("error")
      })

    return () => {
      cancelled = true
    }
  }, [reference, clearCart, router])

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-6 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          {state === "loading" && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <SpinnerIcon className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-foreground">
                Confirming your payment…
              </h1>
              <p className="mt-3 text-muted-foreground">
                Please wait while we verify your transaction with Paystack.
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-foreground">
                Payment confirmed!
              </h1>
              <p className="mt-3 text-muted-foreground">
                {orderNumber
                  ? `Order ${orderNumber} is confirmed. Redirecting you now…`
                  : "Your order is confirmed. Redirecting you now…"}
              </p>
              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full animate-pulse rounded-full bg-emerald-500" style={{ width: "60%" }} />
              </div>
            </>
          )}

          {state === "failed" && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <XCircleIcon className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-foreground">
                Payment unsuccessful
              </h1>
              <p className="mt-3 text-muted-foreground">
                Your payment was not completed. Your cart items have been restored — you can try again from your cart.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/shop/cart"
                  className="inline-flex items-center justify-center rounded-full btn-gradient px-6 py-3 text-sm font-bold text-white shadow-warm transition-all hover:brightness-110"
                >
                  Return to Cart
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary/40"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <XCircleIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="mt-3 text-muted-foreground">
                We couldn&apos;t verify your payment status. If you were charged, please contact support with your order reference.
              </p>
              {reference && (
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Reference: {reference}
                </p>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/shop/cart"
                  className="inline-flex items-center justify-center rounded-full btn-gradient px-6 py-3 text-sm font-bold text-white shadow-warm transition-all hover:brightness-110"
                >
                  Return to Cart
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
  )
}
