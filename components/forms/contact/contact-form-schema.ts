import { z } from "zod"
import { CONTACT_SUBJECT_OPTIONS, type ContactSubjectValue } from "@/app/lib/contact-constants"

const subjectValues = CONTACT_SUBJECT_OPTIONS.map((o) => o.value) as [
  ContactSubjectValue,
  ...ContactSubjectValue[],
]

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Enter a valid email").max(320),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.enum(subjectValues),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(10_000),
  website: z.string().max(500).optional(),
  privacyConsent: z.boolean().refine((v) => v === true, {
    message: "You must agree to the privacy policy",
  }),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
