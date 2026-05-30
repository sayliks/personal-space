"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"

type Heading = {
  id: string
  text: string
  level: 2 | 3
}

export function ArticleToc() {
  const t = useTranslations("post")
  const [headings, setHeadings] = useState<Heading[]>([])
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const container = document.querySelector(".article-prose")
    if (!container) return

    const found: Heading[] = Array.from(
      container.querySelectorAll<HTMLHeadingElement>("h2, h3")
    )
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? "",
        level: el.tagName === "H3" ? 3 : 2,
      }))

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(found)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav
      aria-label={t("tableOfContents")}
      className="mx-auto mb-9 max-w-[728px] px-5 sm:px-6 lg:hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="article-toc-list"
        className="flex w-full items-center justify-between gap-3 py-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground/55 transition-colors hover:text-foreground/75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span>{t("tableOfContents")}</span>
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul id="article-toc-list" className="mt-3 flex flex-col gap-1 border-t border-border/20 pt-3">
          {headings.map((h) => {
            const active = activeId === h.id
            return (
              <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                <a
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "location" : undefined}
                  className="block py-1.5 text-[15px] leading-snug text-muted-foreground/70 transition-colors hover:text-foreground aria-[current=location]:text-foreground"
                >
                  {h.text}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}
