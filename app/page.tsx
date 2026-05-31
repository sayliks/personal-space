import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("home")

  return (
    <main className="knowledge-home mx-auto w-full max-w-[1180px] px-5 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-18">
      <section className="mx-auto max-w-4xl">
        <div>
          <h1 className="knowledge-hero-statement max-w-4xl text-center text-balance">
            {t("knowledgeStatement")}
            {t("knowledgeHighlight") && (
              <span className="knowledge-hero-highlight">{t("knowledgeHighlight")}</span>
            )}
          </h1>
        </div>
      </section>
    </main>
  )
}
