"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Moon, Sun, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("common")
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  if (!mounted) {
    return (
      <button
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground"
        aria-label={t("toggleTheme")}
        disabled
      >
        <Monitor className="size-4" />
      </button>
    )
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={t("toggleTheme")}
    >
      <Icon className="size-4" />
    </button>
  )
}
