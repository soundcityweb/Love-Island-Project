import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ProfileBio } from "@/components/profile/profile-bio"
import { ProfileFunFacts } from "@/components/profile/profile-fun-facts"
import { ProfileGallery } from "@/components/profile/profile-gallery"
import { ProfileSocial } from "@/components/profile/profile-social"
import { fetchIslanderBySlug } from "@/app/lib/api-server"
import { mapIslanderDetail } from "@/app/lib/mappers"
import type { IslanderDetail } from "@/app/types/islander"
import { ProfileVideo } from "@/components/profile/profile-video"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const islanderData = await fetchIslanderBySlug(slug)

  if (!islanderData) {
    return {
      title: "Islander Not Found | Love Island Nigeria",
      description: "The islander you're looking for doesn't exist.",
    }
  }

  const islander = mapIslanderDetail(islanderData)
  const fullName = islander.name
  const description = islander.metaDescription || 
    `Meet ${fullName}, ${islander.age}, from ${islander.location}. ${islander.tagline || ""}. ${islander.bio ? islander.bio.slice(0, 120) + "..." : ""}`

  return {
    title: islander.metaTitle || `${fullName}, ${islander.age} | Love Island Nigeria`,
    description,
    keywords: islander.keywords
      ? islander.keywords.split(",").map((k) => k.trim())
      : [
          fullName,
          "Love Island Nigeria",
          "islander",
          islander.location,
          islander.occupation || "",
          "reality TV",
        ],
    openGraph: {
      title: `${fullName}, ${islander.age} | Love Island Nigeria`,
      description: islander.tagline 
        ? `${islander.tagline}. ${islander.bio ? islander.bio.slice(0, 150) + "..." : ""}`
        : description,
      type: "profile",
      images: islander.ogImage 
        ? [{ url: islander.ogImage, width: 1200, height: 630 }]
        : islander.image 
        ? [{ url: islander.image, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullName}, ${islander.age} | Love Island Nigeria`,
      description: islander.tagline 
        ? `${islander.tagline}. Learn more about ${fullName}.`
        : description,
      images: islander.twitterImage 
        ? [islander.twitterImage]
        : islander.image 
        ? [islander.image]
        : undefined,
    },
  }
}

export default async function IslanderProfilePage({ params }: PageProps) {
  const { slug } = await params
  const islanderData = await fetchIslanderBySlug(slug)

  if (!islanderData) {
    notFound()
  }

  const islander = mapIslanderDetail(islanderData)

  return (
    <main>
        <ProfileHero
          name={islander.name}
          age={islander.age}
          location={islander.location}
          occupation={islander.occupation}
          tagline={islander.tagline}
          image={islander.image}
          coverImage={islander.coverImage}
          status={islander.status}
          profileStatusLabel={islander.profileStatusLabel}
        />
        {islander.bio && <ProfileBio bio={islander.bio} lookingFor={islander.lookingFor} />}
        {islander.funFacts && islander.funFacts.length > 0 && (
          <ProfileFunFacts facts={islander.funFacts} />
        )}
        {islander.gallery && islander.gallery.length > 0 && (
          <ProfileGallery images={islander.gallery} name={islander.name} />
        )}
        {islander.video && (
          <ProfileVideo name={islander.name} video={islander.video} />
        )}
        {islander.socials && islander.socials.length > 0 && (
          <ProfileSocial name={islander.name} socials={islander.socials} />
        )}
    </main>
  )
}
