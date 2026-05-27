import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { SearchDialog } from "@/components/layout/SearchDialog"

export async function Header() {
  const t = await getTranslations("common")

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-brand)" }}>
          {t("siteTitle")}
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/posts" className="hover:text-foreground transition-colors px-2">
            {t("articles")}
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors px-2">
            {t("about")}
          </Link>
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
