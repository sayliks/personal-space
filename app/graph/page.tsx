import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { KnowledgeGraph } from "@/components/blog/KnowledgeGraph"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("graph")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function GraphPage() {
  const t = await getTranslations("graph")

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#050812] px-0 pb-6 pt-5 sm:pb-8">
      <header className="mx-auto mb-4 max-w-6xl px-5 sm:px-6">
        <h1 className="font-mono text-[11px] lowercase tracking-[0.18em] text-slate-600">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
          {t("description")}
        </p>
      </header>

      <div className="mx-auto max-w-[1500px] px-2 sm:px-5">
        <KnowledgeGraph />
      </div>
    </main>
  )
}
