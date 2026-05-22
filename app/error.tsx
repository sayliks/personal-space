"use client"

import { useTranslations } from "next-intl"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50vh]">
      <h2 className="text-xl font-semibold">{t("error.title")}</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        {error.message || t("error.description")}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {t("common.tryAgain")}
      </button>
    </div>
  )
}
