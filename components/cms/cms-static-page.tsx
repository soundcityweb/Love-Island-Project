import { notFound } from "next/navigation"
import { fetchPublishedCmsPageBySlug } from "@/app/lib/cms-pages"
import { formatDate } from "@/app/lib/news"
import { sanitizeCmsHtml } from "@/lib/sanitize-cms-html"

/** Avoid a second H1 when CMS HTML still opens with the same title as the hero. */
function stripLeadingH1(html: string): string {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "").trim()
}

/**
 * Typography aligned with admin TinyMCE `content_style`:
 * ui-sans-serif, 16px, line-height 1.6 — on a white “paper” card like the editor body.
 */
const cmsEditorMirrorProse = [
  "cms-content prose max-w-none font-sans",
  "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-900",
  "prose-h1:text-2xl prose-h1:font-bold md:prose-h1:text-3xl",
  "prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3",
  "prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-2",
  "prose-p:text-base prose-p:leading-[1.6] prose-p:text-zinc-800",
  "prose-li:text-base prose-li:leading-[1.6] prose-li:text-zinc-800",
  "prose-strong:text-zinc-900",
  "prose-blockquote:border-l-primary prose-blockquote:text-zinc-700",
  "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
  "prose-img:rounded-lg prose-hr:border-zinc-200",
  "dark:prose-headings:text-foreground dark:prose-p:text-foreground/90 dark:prose-li:text-foreground/90 dark:prose-strong:text-foreground",
].join(" ")

export async function CmsStaticPage({ slug }: { slug: string }) {
  const page = await fetchPublishedCmsPageBySlug(slug)
  if (!page) notFound()

  const safeHtml = stripLeadingH1(sanitizeCmsHtml(page.content))
  const updatedLabel = page.updatedAt ? formatDate(page.updatedAt) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Hero — matches News / Podcasts / Competitions */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-li-sunset" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,77,128,0.25),transparent)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.45em] text-white/65">
            ✦ &nbsp;Legal &nbsp;·&nbsp; Love Island Nigeria&nbsp; ✦
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-8xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 lg:text-xl">
            Please read this document carefully. It applies when you use our website and related Love
            Island Nigeria services.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px max-w-[80px] flex-1 bg-white/25" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              Official &nbsp;·&nbsp; Love Island Nigeria &nbsp;·&nbsp; For fans and visitors
            </p>
          </div>
        </div>
      </section>

      {/* Meta strip */}
      <section
        className="border-b border-border bg-muted/60 px-4 py-4 md:px-8 lg:px-12"
        aria-label="Document information"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-foreground">Legal document</span>
          {updatedLabel ? (
            <p className="text-sm text-muted-foreground">
              Last updated{" "}
              <time dateTime={page.updatedAt}>{updatedLabel}</time>
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </section>

      {/* Body — white “editor canvas” card (matches admin CMS form content area) */}
      <section
        className="border-b border-border bg-muted/40 px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-16"
        aria-label="Document content"
      >
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm md:p-8 lg:p-10 dark:border-border dark:bg-card dark:shadow-md">
            <article
              className={cmsEditorMirrorProse}
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
