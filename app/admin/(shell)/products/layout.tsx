import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Product Management - Admin | Love Island Nigeria",
  description:
    "Manage merchandise listings, inventory, and pricing for the Love Island Nigeria official store.",
}

export default function AdminProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
