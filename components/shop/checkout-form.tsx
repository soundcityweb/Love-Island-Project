"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/shop/cart-context"

// ----- Icons ----- //

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

// ----- Types ----- //

interface FormFields {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

// ----- Helpers ----- //

function formatPrice(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {}
  if (!fields.firstName.trim()) errors.firstName = "First name is required."
  if (!fields.lastName.trim()) errors.lastName = "Last name is required."
  if (!fields.email.trim()) {
    errors.email = "Email address is required."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Enter a valid email address."
  }
  if (fields.phone.trim() && !/^[+\d][\d\s\-()]{6,19}$/.test(fields.phone.trim())) {
    errors.phone = "Enter a valid phone number."
  }
  if (!fields.address.trim()) errors.address = "Street address is required."
  if (!fields.city.trim()) errors.city = "City is required."
  if (!fields.state.trim()) errors.state = "State is required."
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  )
}

// ----- Empty cart state ----- //

function EmptyCartState() {
  return (
    <div className="relative mx-auto max-w-lg px-6 py-20 text-center md:py-28">
      <div className="animate-checkout-fade-up mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/15 ring-2 ring-primary/20">
        <CartIcon className="h-9 w-9 text-primary" />
      </div>
      <p className="animate-checkout-fade-up animate-checkout-delay-1 mt-8 font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
        Nothing to check out yet
      </p>
      <h1 className="animate-checkout-fade-up animate-checkout-delay-1 mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">
        Your bag&apos;s waiting to be filled
      </h1>
      <p className="animate-checkout-fade-up animate-checkout-delay-2 mt-4 text-pretty text-muted-foreground md:text-lg">
        When you&apos;re ready, come back here — we&apos;ll make checkout fast
        and secure.
      </p>
      <Link
        href="/shop"
        className="animate-checkout-fade-up animate-checkout-delay-3 mt-10 inline-flex rounded-full border-0 btn-gradient px-8 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-warm transition-all hover:brightness-110"
      >
        Shop the Villa
      </Link>
    </div>
  )
}

// ----- Component ----- //

interface AppliedCoupon {
  code: string
  discountAmount: number
  discountType: string
  discountValue: number
}

export function CheckoutForm() {
  const { items, totalItems } = useCart()

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const currency = items[0]?.currency ?? "NGN"

  const [fields, setFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Coupon state
  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const total = Math.max(0, subtotal - discountAmount)

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderSubtotal: subtotal }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCouponError(data.message ?? "Invalid coupon code.")
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
        })
        setCouponError(null)
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.")
    } finally {
      setCouponLoading(false)
    }
  }, [couponInput, subtotal])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFields((prev) => ({ ...prev, [name]: value }))
      if (errors[name as keyof FormFields]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }
    },
    [errors],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)

      const fieldErrors = validate(fields)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        const firstErrorField = Object.keys(fieldErrors)[0]
        document.getElementById(firstErrorField)?.focus()
        return
      }

      setSubmitting(true)
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
            customerFirstName: fields.firstName.trim(),
            customerLastName: fields.lastName.trim(),
            customerEmail: fields.email.trim(),
            customerPhone: fields.phone.trim() || null,
            shippingAddress: fields.address.trim(),
            shippingCity: fields.city.trim(),
            shippingState: fields.state.trim(),
            ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
          }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message =
            typeof data.message === "string"
              ? data.message
              : Array.isArray(data.message)
                ? data.message.join(", ")
                : "Something went wrong. Please try again."
          setSubmitError(message)
          setSubmitting(false)
          return
        }

        // Redirect to Paystack payment page.
        // Cart is intentionally NOT cleared here — it is only cleared on the
        // callback page after Paystack confirms a successful payment.
        if (typeof data.paymentUrl === "string" && data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          setSubmitError("Could not initiate payment. Please try again.")
          setSubmitting(false)
        }
      } catch {
        setSubmitError("Network error. Please check your connection and try again.")
        setSubmitting(false)
      }
    },
    [fields, items, appliedCoupon],
  )

  if (items.length === 0) return <EmptyCartState />

  return (
    <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-20">
      {/* Breadcrumb */}
      <nav
        className="animate-checkout-fade-up mb-12 flex items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/shop/cart"
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Cart
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-semibold text-foreground">Secure checkout</span>
      </nav>

      {/* Premium headline + trust — editorial, not corporate */}
      <header className="animate-checkout-fade-up animate-checkout-delay-1 mb-14 max-w-3xl">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-primary">
          Almost yours
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-[3.15rem] lg:leading-[1.1]">
          You&apos;re One Step Closer
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Take a breath — you&apos;re in safe hands. Your details stay encrypted,
          checkout is powered by trusted payments, and we only use what we need
          to get your villa merch to your door.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/80 pt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <LockIcon className="h-4 w-4 text-primary" />
            </span>
            <span>SSL-secured form</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <ShieldIcon className="h-4 w-4 text-primary" />
            </span>
            <span>Trusted payment partner</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-20">
        {/* Left — Customer form */}
        <div className="animate-checkout-fade-up animate-checkout-delay-2 lg:col-span-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            {/* Contact Information */}
            <fieldset className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8">
              <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-foreground">
                <span
                  className="h-1 w-9 rounded-full bg-gradient-to-r from-primary to-accent"
                  aria-hidden
                />
                Contact Information
              </legend>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Amara"
                    value={fields.firstName}
                    onChange={handleChange}
                    aria-invalid={!!errors.firstName}
                    disabled={submitting}
                  />
                  <FieldError message={errors.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Okonkwo"
                    value={fields.lastName}
                    onChange={handleChange}
                    aria-invalid={!!errors.lastName}
                    disabled={submitting}
                  />
                  <FieldError message={errors.lastName} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="amara@example.com"
                    value={fields.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    disabled={submitting}
                  />
                  <FieldError message={errors.email} />
                  {!errors.email && (
                    <p className="text-xs text-muted-foreground">Order confirmation will be sent here.</p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={fields.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    disabled={submitting}
                  />
                  <FieldError message={errors.phone} />
                </div>
              </div>
            </fieldset>

            <div
              className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
              aria-hidden
            />

            {/* Shipping Address */}
            <fieldset className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8">
              <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-foreground">
                <span
                  className="h-1 w-9 rounded-full bg-gradient-to-r from-primary to-accent"
                  aria-hidden
                />
                Shipping Address
              </legend>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">
                    Street Address <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="12 Marina Road"
                    value={fields.address}
                    onChange={handleChange}
                    aria-invalid={!!errors.address}
                    disabled={submitting}
                  />
                  <FieldError message={errors.address} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Lagos"
                    value={fields.city}
                    onChange={handleChange}
                    aria-invalid={!!errors.city}
                    disabled={submitting}
                  />
                  <FieldError message={errors.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Lagos"
                    value={fields.state}
                    onChange={handleChange}
                    aria-invalid={!!errors.state}
                    disabled={submitting}
                  />
                  <FieldError message={errors.state} />
                </div>
              </div>
            </fieldset>

            {/* Promo Code */}
            <fieldset className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm sm:p-8">
              <legend className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-foreground">
                <span className="h-1 w-9 rounded-full bg-gradient-to-r from-primary to-accent" aria-hidden />
                Promo Code
              </legend>
              <div className="mt-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-700">{appliedCoupon.code} applied!</p>
                      <p className="text-xs text-emerald-600">
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% off`
                          : `${formatPrice(appliedCoupon.discountValue, currency)} off`}{" "}
                        — saving {formatPrice(appliedCoupon.discountAmount, currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}
                      className="ml-4 text-xs font-bold text-emerald-700 underline hover:no-underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                      placeholder="Enter promo code"
                      disabled={couponLoading || submitting}
                      className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading || submitting}
                      className="h-11 min-w-[80px] rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {couponLoading ? "…" : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-xs font-medium text-destructive">{couponError}</p>
                )}
              </div>
            </fieldset>

            <Separator />

            {/* Submit error */}
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            {/* Confirm button — native button so gradient isn&apos;t overridden by UI variants */}
            <div className="flex flex-col gap-5 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-0 text-base font-black text-white shadow-warm btn-gradient transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                    Taking you to secure pay&hellip;
                  </>
                ) : (
                  <>
                    <LockIcon className="h-5 w-5" />
                    Complete order — {formatPrice(total, currency)}
                  </>
                )}
              </button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  You&apos;ll finish payment on our secure partner page — same
                  protection as major banks.
                </span>
              </p>
            </div>
          </form>
        </div>

        {/* Right — Order summary */}
        <aside
          className="animate-checkout-fade-up animate-checkout-delay-3 lg:col-span-5"
          aria-label="Order summary"
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-warm backdrop-blur-sm lg:sticky lg:top-24">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-yellow-400" aria-hidden />
            <div className="p-6 lg:p-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-card-foreground">
              Your order
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalItems} piece{totalItems !== 1 ? "s" : ""} ready to ship to you
            </p>

            <Separator className="my-6" />

            {/* Line items */}
            <ul className="space-y-5" aria-label="Items in order">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 transition-transform duration-300 hover:translate-x-0.5"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-secondary ring-1 ring-primary/5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-bold text-card-foreground leading-snug">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Qty {item.quantity}</p>
                    <p className="mt-1 text-sm font-bold text-card-foreground">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Separator className="my-6" />

            {/* Subtotal + discount */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="tabular-nums">−{formatPrice(appliedCoupon.discountAmount, currency)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-black text-card-foreground">Total</span>
              <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                {formatPrice(total, currency)}
              </span>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-dashed border-primary/20 bg-primary/[0.04] px-4 py-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LockIcon className="h-3.5 w-3.5" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldIcon className="h-3.5 w-3.5" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                <span>Easy returns</span>
              </div>
            </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
