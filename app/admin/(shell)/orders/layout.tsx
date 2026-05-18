import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders - Admin | Love Island Nigeria",
  description:
    "Track and manage all merchandise orders for the Love Island Nigeria store.",
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
