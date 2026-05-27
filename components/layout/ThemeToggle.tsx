"use client"

import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("common")

  if (!resolvedTheme) {
    return <div className="size-8" />
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-md size-8 hover:bg-muted transition-colors"
      aria-label={t("toggleTheme")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  )
}
