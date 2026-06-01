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
          className="site-brand-title text-[22px] font-bold leading-none text-foreground/82 transition-colors hover:text-foreground"
        >
          {t("siteTitle")}
        </Link>
        <HeaderNav
          labels={{
            about: t("about"),
            search: t("search"),
          }}
        />
      </div>
    </header>
  )
}
