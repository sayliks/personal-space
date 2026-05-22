"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations()

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50vh]">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h2 className="text-xl font-semibold">{t("notFound.title")}</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        {t("notFound.description")}
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {t("common.backToHome")}
      </Link>
    </div>
  )
}
