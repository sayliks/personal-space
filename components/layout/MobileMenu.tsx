"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

type MobileMenuProps = {
  labels: {
    articles: string
    graph: string
    about: string
    search: string
  }
}

const links = [
  { href: "/posts", key: "articles" },
  { href: "/graph", key: "graph" },
  { href: "/about", key: "about" },
  { href: "/search", key: "search" },
] as const

export function MobileMenu({ labels }: MobileMenuProps) {
  const t = useTranslations("common")
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label={t("menu")}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Menu className="size-[18px]" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-background/60 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-x-0 top-0 z-50 origin-top border-b border-border/30 bg-background/95 px-5 pb-8 pt-3.5 outline-none supports-backdrop-filter:backdrop-blur-xl data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-top-2 sm:px-6">
          <div className="mx-auto flex max-w-[760px] items-center justify-between">
            <DialogPrimitive.Title className="font-mono text-[13px] text-foreground/78">
              {t("navigation")}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={t("closeMenu")}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <X className="size-[18px]" />
            </DialogPrimitive.Close>
          </div>

          <nav className="mx-auto mt-6 flex max-w-[760px] flex-col">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="py-3 font-serif text-2xl text-foreground/70 transition-colors hover:text-foreground aria-[current=page]:text-foreground"
                >
                  {labels[link.key]}
                </Link>
              )
            })}
          </nav>

          <div className="mx-auto mt-6 flex max-w-[760px] items-center justify-between border-t border-border/20 pt-5">
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground/50">
              {t("appearance")}
            </span>
            <ThemeToggle />
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
