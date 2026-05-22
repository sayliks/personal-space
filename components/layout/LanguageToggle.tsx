"use client"

import { useLocale } from "next-intl"
import { useTransition } from "react"
import { useRouter, usePathname } from "@/i18n/navigation"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = locale === "zh" ? "en" : "zh"
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md size-8 text-xs font-medium hover:bg-muted transition-colors"
      aria-label="Switch language"
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  )
}
