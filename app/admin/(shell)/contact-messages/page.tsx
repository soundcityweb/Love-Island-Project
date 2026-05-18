import type { Metadata } from "next"
import { ContactMessagesAdmin } from "@/components/admin/contact-messages-admin"

export const metadata: Metadata = {
  title: "Contact Messages - Admin | Love Island Nigeria",
  description: "Manage public contact form submissions.",
}

export default function AdminContactMessagesPage() {
  return <ContactMessagesAdmin />
}
