"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminLayout } from "@/components/admin/layout"
import { DEFAULT_ADMIN_NAV_ITEMS, type SidebarNavItem } from "@/components/admin/sidebar"

function withContactBadge(items: SidebarNavItem[], count: number): SidebarNavItem[] {
  return items.map((item) =>
    item.href === "/admin/contact-messages" ? { ...item, badge: count > 0 ? count : undefined } : item,
  )
}

export function AdminShellWithNav({ children }: { children: React.ReactNode }) {
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch("/api/admin/contact-messages/stats", { cache: "no-store" })
        if (!res.ok) return
        const d = (await res.json()) as { newCount?: number }
        if (!cancelled && typeof d.newCount === "number") setNewCount(d.newCount)
      } catch {
        /* unauthenticated or network */
      }
    }
    poll()
    const t = setInterval(poll, 60_000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const navItems = useMemo(
    () => withContactBadge(DEFAULT_ADMIN_NAV_ITEMS, newCount),
    [newCount],
  )

  return <AdminLayout navItems={navItems}>{children}</AdminLayout>
}
