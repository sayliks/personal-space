"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchDialog } from "@/components/layout/SearchDialog"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

type HeaderNavProps = {
  labels: {
    articles: string
    graph: string
    about: string
  }
}

const links = [
  { href: "/posts", key: "articles" },
  { href: "/graph", key: "graph" },
  { href: "/about", key: "about" },
] as const

export function HeaderNav({ labels }: HeaderNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground/48 sm:gap-4">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="relative py-1 transition-colors hover:text-foreground/72 aria-[current=page]:text-foreground/68"
          >
            {labels[link.key]}
            {active && (
              <span className="absolute -bottom-1 left-1/2 h-px w-5 -translate-x-1/2 bg-foreground/18" />
            )}
          </Link>
        )
      })}
      <SearchDialog />
      <ThemeToggle />
    </nav>
  )
}
