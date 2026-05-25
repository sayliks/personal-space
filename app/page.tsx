import { getTranslations } from "next-intl/server"
import { RecentPosts } from "@/components/blog/RecentPosts"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  return {
    title: t("siteTitle"),
    description: t("tagline"),
  }
}

export default async function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <RecentPosts />
    </div>
  )
}
