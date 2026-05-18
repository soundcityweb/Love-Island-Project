export type ContactMessageStatus = "new" | "in_progress" | "resolved"

export interface ContactListItem {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  status: ContactMessageStatus
  category: string
  isUrgent: boolean
  createdAt: string
  hasAttachment: boolean
}

export interface ContactListResponse {
  data: ContactListItem[]
  total: number
  page: number
  limit: number
}

export interface ContactReplyRow {
  id: string
  body: string
  sentByLabel: string | null
  createdAt: string
}

export interface ContactDetail {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  attachmentUrl: string | null
  status: ContactMessageStatus
  category: string
  isUrgent: boolean
  firstResponseAt: string | null
  createdAt: string
  updatedAt: string
  replies: ContactReplyRow[]
}
