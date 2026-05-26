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
  const t = await getTranslations("home")

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        {t("siteTitle")}
      </h1>
      <p className="text-muted-foreground mt-2">{t("tagline")}</p>
    </div>
  )
}
