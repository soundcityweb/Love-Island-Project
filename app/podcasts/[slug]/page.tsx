import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchPodcastBySlug } from "@/app/lib/api-server"
import { previewNotes } from "@/app/podcasts/preview-notes"
import { PodcastDetail } from "@/components/podcasts/podcast-detail"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw)
  const episode = await fetchPodcastBySlug(slug)

  if (!episode) {
    return { title: "Episode Not Found | Love Island Nigeria" }
  }

  const description = previewNotes(episode.notes, 160)

  return {
    title: `${episode.title} | Podcast | Love Island Nigeria`,
    description,
    openGraph: {
      title: episode.title,
      description,
      type: "website",
    },
  }
}

export default async function PodcastEpisodePage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug)

  const episode = await fetchPodcastBySlug(slug)

  if (!episode) {
    notFound()
  }

  return <PodcastDetail episode={episode} />
}
