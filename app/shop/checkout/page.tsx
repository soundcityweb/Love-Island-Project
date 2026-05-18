import type { Metadata } from "next"
import { CheckoutForm } from "@/components/shop/checkout-form"

export const metadata: Metadata = {
  title: "Checkout — Love Island Nigeria Merch",
  description:
    "You're one step closer. Secure checkout for official Love Island Nigeria merch — encrypted, trusted payments.",
}

export default function CheckoutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient premium wash — subtle, not corporate */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(255,77,128,0.09),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.035] via-transparent to-accent/[0.06]"
        aria-hidden
      />
      <CheckoutForm />
    </main>
  )
}
