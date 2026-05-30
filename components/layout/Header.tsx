import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { HeaderNav } from "@/components/layout/HeaderNav"

export async function Header() {
  const t = await getTranslations("common")

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-background/78 backdrop-blur-md">
      <div className="mx-auto flex max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Link
          href="/"
          className="font-mono text-[13px] text-foreground/78 transition-colors hover:text-foreground"
        >
          {t("siteTitle")}
        </Link>
        <HeaderNav labels={{ articles: t("articles"), graph: t("graph"), about: t("about") }} />
      </div>
    </header>
  )
}
