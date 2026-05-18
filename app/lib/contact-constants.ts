/** Mirrors api ContactSubject enum values */
export const CONTACT_SUBJECT_OPTIONS = [
  { value: "general_inquiry", label: "General Inquiry" },
  { value: "support", label: "Support" },
  { value: "partnerships", label: "Partnerships" },
  { value: "media", label: "Media" },
  { value: "other", label: "Other" },
] as const

export type ContactSubjectValue = (typeof CONTACT_SUBJECT_OPTIONS)[number]["value"]

export const CONTACT_DISPLAY = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@loveislandnigeria.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+234 800 000 0000",
  office:
    process.env.NEXT_PUBLIC_CONTACT_OFFICE ||
    "Lagos, Nigeria — studio & production enquiries via email.",
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://www.instagram.com/",
  twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "https://twitter.com/",
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://www.youtube.com/",
} as const
