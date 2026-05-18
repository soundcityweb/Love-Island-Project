import { AdminShellWithNav } from "@/components/admin/admin-shell-with-nav"

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellWithNav>{children}</AdminShellWithNav>
}
