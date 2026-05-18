import type { Metadata } from "next"
import { CmsStaticPage } from "@/components/cms/cms-static-page"
import { fetchPublishedCmsPageBySlug } from "@/app/lib/cms-pages"

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPublishedCmsPageBySlug("terms-conditions")
  if (!page) {
    return { title: "Page Not Found | Love Island Nigeria" }
  }
  const titleBase = page.metaTitle?.trim() || page.title
  const description = page.metaDescription?.trim() || undefined
  return {
    title: `${titleBase} | Love Island Nigeria`,
    description,
    openGraph: {
      title: titleBase,
      description,
    },
  }
}

export default function TermsConditionsPage() {
  return <CmsStaticPage slug="terms-conditions" />
}
