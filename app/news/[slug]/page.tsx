import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArticleDetail } from "@/components/news/article-detail"
import {
  absoluteArticleImage,
  fetchArticleBySlug,
  fetchRelatedArticles,
  getAllSlugs,
} from "@/app/lib/news"

// ---------------------------------------------------------------------------
// Route segment types
// ---------------------------------------------------------------------------

type Props = { params: Promise<{ slug: string }> }

// ---------------------------------------------------------------------------
// Static params (used at build time for static generation)
// ---------------------------------------------------------------------------

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs()
  return Array.isArray(slugs) ? slugs.map((slug) => ({ slug })) : []
}

// ---------------------------------------------------------------------------
// Metadata
//
// Placeholder annotations mark fields that should be sourced from your CMS
// once one is connected. Every SEO-relevant Open Graph / Twitter field is
// included so the page immediately works with social preview cards.
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)

  if (!article) {
    return { title: "Article Not Found | Love Island Nigeria" }
  }

  // CMS placeholder: replace `siteUrl` with an env var (e.g. process.env.NEXT_PUBLIC_SITE_URL)
  const siteUrl = "https://loveislandnigeria.com"
  const canonicalUrl = `${siteUrl}/news/${article.slug}`
  // CMS placeholder: replace with article.heroImage.url (1200×630 crop) from your CMS
  const ogImageUrl = `${siteUrl}${article.image}`

  return {
    // CMS placeholder: article.seoTitle ?? article.title
    title: `${article.title} | Love Island Nigeria`,
    // CMS placeholder: article.metaDescription ?? article.excerpt
    description: article.excerpt,
    // CMS placeholder: article.tags from your CMS
    keywords: [
      "Love Island Nigeria",
      article.category,
      // CMS: ...article.tags
    ],
    authors: [
      // CMS placeholder: { name: article.author.name, url: article.author.profileUrl }
      { name: article.author },
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: "Love Island Nigeria",
      title: article.title,
      description: article.excerpt,
      // CMS placeholder: article.publishedAt (ISO-8601 datetime)
      publishedTime: article.date,
      // CMS placeholder: article.updatedAt
      modifiedTime: article.date,
      // CMS placeholder: article.author.name
      authors: [article.author],
      // CMS placeholder: article.category (maps to og:article:section)
      section: article.category,
      // CMS placeholder: article.tags (maps to og:article:tag[])
      tags: [article.category],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      // CMS placeholder: site.twitterHandle
      site: "@LoveIslandNG",
      title: article.title,
      description: article.excerpt,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// ---------------------------------------------------------------------------
// Structured data helpers
// ---------------------------------------------------------------------------

function buildArticleJsonLd(
  article: Awaited<ReturnType<typeof fetchArticleBySlug>> & object,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    // CMS placeholder: article.seoTitle ?? article.title
    headline: article.title,
    description: article.excerpt,
    image: [absoluteArticleImage(siteUrl, article.image)],
    // CMS placeholder: article.publishedAt
    datePublished: article.date,
    // CMS placeholder: article.updatedAt
    dateModified: article.date,
    author: {
      "@type": "Person",
      // CMS placeholder: article.author.name
      name: article.author,
      // CMS placeholder: article.author.profileUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Love Island Nigeria",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        // CMS placeholder: site.logoUrl
        url: `${siteUrl}/images/logo.png`,
      },
    },
    url: `${siteUrl}/news/${article.slug}`,
    // CMS placeholder: article.category
    articleSection: article.category,
    // CMS placeholder: article.tags
    keywords: article.category,
  }
}

function buildBreadcrumbJsonLd(title: string, slug: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "News",
        item: `${siteUrl}/news`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${siteUrl}/news/${slug}`,
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  const [article, relatedArticles] = await Promise.all([
    fetchArticleBySlug(slug),
    fetchRelatedArticles(slug, 3),
  ])

  if (!article) notFound()

  // CMS placeholder: replace with process.env.NEXT_PUBLIC_SITE_URL
  const siteUrl = "https://loveislandnigeria.com"

  return (
    <>
      {/* NewsArticle structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleJsonLd(article, siteUrl)),
        }}
      />
      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(article.title, article.slug, siteUrl)),
        }}
      />

      <ArticleDetail article={article} relatedArticles={relatedArticles} />
    </>
  )
}
