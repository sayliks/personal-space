import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

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
    </div>
  )
}
