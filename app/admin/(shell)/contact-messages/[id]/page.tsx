import type { Metadata } from "next"
import { ContactMessageDetailAdmin } from "@/components/admin/contact-message-detail-admin"

export const metadata: Metadata = {
  title: "Contact Message - Admin | Love Island Nigeria",
  description: "View and reply to a contact message.",
}

export default async function AdminContactMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ContactMessageDetailAdmin id={id} />
}
