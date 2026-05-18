"use client"

import { useCart } from "@/app/shop/cart-context"

/**
 * Shows the total item count as a badge overlay on the cart icon.
 * Renders nothing until the cart is hydrated from localStorage to avoid
 * a hydration mismatch.
 */
export function CartBadge() {
  const { totalItems, hydrated } = useCart()
  if (!hydrated || totalItems === 0) return null
  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {totalItems > 99 ? "99+" : totalItems}
    </span>
  )
}
