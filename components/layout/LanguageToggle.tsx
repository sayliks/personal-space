"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"

const LOCALE_COOKIE = "NEXT_LOCALE"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()

  function toggle() {
    const next = locale === "zh" ? "en" : "zh"
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md size-8 text-xs font-medium hover:bg-muted transition-colors"
      aria-label="Switch language"
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  )
}
