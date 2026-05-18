import type { Metadata } from "next"
import { HeroSection } from "@/components/landing/hero-section"
import { CountdownSection } from "@/components/landing/countdown-section"
import { IslandersSection } from "@/components/landing/islanders-section"
import { VideoSection } from "@/components/landing/video-section"
import { SponsorsSection } from "@/components/landing/sponsors-section"
import { fetchLandingContent, fetchIslanders, fetchVideos } from "@/app/lib/api-server"
import {
  mapIslanderListItem,
  mapLandingContent,
  mergePublishedVideosIntoVideoSection,
} from "@/app/lib/mappers"
import type { LandingPageContent } from "@/app/types/landing"
import type { Islander } from "@/app/types/islander"

export const metadata: Metadata = {
  title: {
    default: "Love Island Nigeria | Couple Up. Stand Out.",
    template: "%s | Love Island Nigeria",
  },
  description:
    "Fifty islanders. One villa. Endless drama. Who will couple up and find love — and who goes home broken-hearted? Find out on Love Island Nigeria.",
  keywords: [
    "Love Island",
    "Nigeria",
    "reality TV",
    "dating show",
    "islanders",
    "villa",
    "coupling up",
  ],
  openGraph: {
    title: "Love Island Nigeria | Couple Up. Stand Out.",
    description:
      "Fifty islanders. One villa. Endless drama. Who will couple up and find love — and who goes home broken-hearted? Find out on Love Island Nigeria.",
    type: "website",
    locale: "en_NG",
    // TODO: Add actual OG image URL
    // images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Island Nigeria | Couple Up. Stand Out.",
    description:
      "Fifty islanders. One villa. Endless drama. Who will couple up and find love — and who goes home broken-hearted? Find out on Love Island Nigeria.",
    // TODO: Add actual Twitter image URL
    // images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function Page() {
  const [landingData, islandersData, publishedVideos] = await Promise.all([
    fetchLandingContent(),
    fetchIslanders(),
    fetchVideos(),
  ])

  // Ensure islandersData is always an array and transform to include status
  const islanders: Islander[] = Array.isArray(islandersData) 
    ? islandersData.map((item) => {
        const mapped = mapIslanderListItem(item)
        // Add default status for landing page (status not critical here)
        const status: Islander["status"] = mapped.status ? 
          (mapped.status === "cast" || mapped.status === "in_villa" ? "Active" :
           mapped.status === "coupled" ? "Coupled" :
           mapped.status === "eliminated" ? "Eliminated" :
           mapped.status === "winner" ? "Winner" : "Active") 
          : "Active"
        return {
          ...mapped,
          status,
        } as Islander
      })
    : []

  const videoList = Array.isArray(publishedVideos) ? publishedVideos : []

  // Handle empty state: fallback to default content if API fails
  const baseLanding: LandingPageContent = landingData
    ? mapLandingContent(landingData, islanders)
    : {
        hero: {
          season: "Season 1",
          title: "Come for the Love.",
          titleHighlight: "Stay for the Drama.",
          description:
            "One villa. Fifty hearts on the line. The most talked-about show in Nigeria is here — and someone is about to fall hard.",
          ctaPrimary: {
            label: "Be an Islander",
            href: "/apply",
          },
          ctaSecondary: {
            label: "Watch Trailer",
            href: "#videos",
          },
          stats: {
            applicants: "10K+",
            days: "30",
            winningCouple: "1",
          },
          backgroundImage: "/images/hero-bg.jpg",
        },
        countdown: {
          label: "Get Ready, Nigeria",
          title: "The Villa Opens In",
          timeUnits: [
            { label: "Days", value: "42" },
            { label: "Hours", value: "08" },
            { label: "Minutes", value: "36" },
            { label: "Seconds", value: "12" },
          ],
          footerText:
            "Catch every moment live on Soundcity, Spice, ONTV and digital platforms",
        },
        islanders,
        videos: {
          label: "Inside the Villa",
          title: "The Drama Is Already Starting",
          description:
            "Confessions. Confrontations. Couple moments you won't believe. The villa has zero chill — watch every unmissable clip straight from inside.",
          featuredVideo: {
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            title: "Love Island Nigeria — Official Trailer",
            description:
              "Your first look inside the villa — new islanders, new connections, and drama from night one.",
          },
          clips: [],
          ctaLabel: "Watch All the Drama",
          ctaHref: "#",
        },
        sponsors: {
          label: "Making It Possible",
          title: "The Brands Behind the Love",
          description:
            "These incredible partners are making Nigeria's most talked-about show happen. We couldn't do this without them.",
          titleSponsors: [],
          officialPartners: [],
          cta: {
            label: "Want In?",
            title: "Get your brand into the villa",
            description:
              "Millions of passionate fans. Wall-to-wall social coverage. Nigeria's biggest water-cooler moment of the year. Your brand belongs here.",
            buttonLabel: "Let's Talk",
            href: "#",
          },
        },
      }

  const landingContent: LandingPageContent = {
    ...baseLanding,
    videos: mergePublishedVideosIntoVideoSection(baseLanding.videos, videoList),
  }

  return (
    <main>
      <HeroSection content={landingContent.hero} />
      <CountdownSection content={landingContent.countdown} />
      <IslandersSection islanders={landingContent.islanders} />
      <VideoSection content={landingContent.videos} />
      <SponsorsSection content={landingContent.sponsors} />
    </main>
  )
}
