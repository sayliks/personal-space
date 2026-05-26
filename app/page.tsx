import { getTranslations } from "next-intl/server"
import { KnowledgeGraph } from "@/components/blog/KnowledgeGraph"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  return {
    title: t("siteTitle"),
    description: t("tagline"),
  }
}

export default async function HomePage() {
  const t = await getTranslations("graph")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <p className="text-center text-muted-foreground text-sm">{t("subtitle")}</p>
      <KnowledgeGraph />
    </div>
  )
}
