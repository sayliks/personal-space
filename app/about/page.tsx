import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about")
  return {
    title: t("title"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("about")

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <p className="text-muted-foreground leading-relaxed">{t("content")}</p>
    </div>
  )
}
