"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Menu, X } from "lucide-react"

type NavigationMenuProps = {
  labels: {
    articles: string
    about: string
    search: string
  }
}

const links = [
  { href: "/posts", key: "articles" },
  { href: "/about", key: "about" },
  { href: "/search", key: "search" },
] as const

const desktopLinks = links.filter((link) => link.key !== "search")

export function NavigationMenu({ labels }: NavigationMenuProps) {
  const t = useTranslations("common")
  const homeT = useTranslations("home")
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const panelLinks = [
    { href: "/", label: homeT("indexLabel") },
    { href: "/posts", label: labels.articles },
    { href: "/search", label: labels.search },
    { href: "/about", label: labels.about },
  ]

  const panelGroups = [
    {
      title: homeT("moduleNavigation"),
      links: [
        {
          href: "/posts",
          label: homeT("moduleNotes"),
          description: homeT("moduleNotesDesc"),
        },
        {
          href: "/search",
          label: homeT("moduleTools"),
          description: homeT("moduleToolsDesc"),
        },
      ],
    },
    {
      title: homeT("starterTitle"),
      links: [
        {
          href: "/",
          label: homeT("starterBegin"),
          description: homeT("starterBeginMeta"),
        },
        {
          href: "/posts",
          label: homeT("starterRevisit"),
          description: homeT("starterRevisitMeta"),
        },
      ],
    },
  ]

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <nav
        aria-label={t("navigation")}
        className="hidden items-center gap-1 md:flex"
      >
        {desktopLinks.map((link) => {
          const active = isActive(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[current=page]:text-foreground"
            >
              {labels[link.key]}
            </Link>
          )
        })}
      </nav>

      <div className="navigation-hover-panel invisible pointer-events-none absolute inset-x-0 top-full hidden translate-y-1 border-b border-border/40 opacity-0 transition duration-200 group-hover/header:visible group-hover/header:pointer-events-auto group-hover/header:translate-y-0 group-hover/header:opacity-100 group-focus-within/header:visible group-focus-within/header:pointer-events-auto group-focus-within/header:translate-y-0 group-focus-within/header:opacity-100 md:block">
        <div className="mx-auto grid w-full max-w-[760px] grid-cols-[minmax(0,0.95fr)_minmax(260px,1.05fr)] gap-10 px-5 py-8 sm:px-6 md:py-10">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/42 dark:text-foreground/46">
              {t("navigation")}
            </p>
            <nav className="mt-5 flex flex-col gap-1">
              {panelLinks.map((link) => {
                const active = isActive(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="navigation-panel-link group relative py-1.5 transition duration-200 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <span className="absolute left-0 top-1/2 size-1.5 -translate-x-5 -translate-y-1/2 rounded-full bg-current opacity-0 transition-opacity group-aria-[current=page]:opacity-35" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="grid grid-cols-1 gap-7 pt-1 lg:grid-cols-2">
            {panelGroups.map((group) => (
              <section key={group.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/42 dark:text-foreground/46">
                  {group.title}
                </p>
                <div className="mt-5 space-y-4">
                  {group.links.map((link) => {
                    const active = isActive(link.href)

                    return (
                      <Link
                        key={`${group.title}-${link.href}-${link.label}`}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className="navigation-panel-small-link group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <span className="block text-sm font-semibold text-foreground/82 transition-colors group-hover:text-foreground group-aria-[current=page]:text-foreground">
                          {link.label}
                        </span>
                        <span className="mt-1 block text-[12px] leading-5 text-muted-foreground">
                          {link.description}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <DialogPrimitive.Trigger
        aria-label={t("menu")}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
      >
        <Menu className="size-[18px]" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 dark:bg-black/20 md:hidden" />
        <DialogPrimitive.Popup className="navigation-overlay fixed inset-0 z-50 flex flex-col px-5 pb-8 pt-3.5 outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-1 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-top-1 sm:px-6 md:hidden">
          <div className="mx-auto flex w-full max-w-[760px] items-center justify-between">
            <DialogPrimitive.Title className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/42 dark:text-foreground/46">
              {t("navigation")}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={t("closeMenu")}
              className="inline-flex size-8 items-center justify-center rounded-md text-foreground/52 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <X className="size-[18px]" />
            </DialogPrimitive.Close>
          </div>

          <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center py-8 sm:py-12">
            <nav className="flex flex-col gap-1 sm:gap-2">
              {links.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="navigation-menu-link group relative py-1.5 transition duration-200 hover:translate-x-1"
                  >
                    <span className="absolute left-0 top-1/2 size-1.5 -translate-x-5 -translate-y-1/2 rounded-full bg-current opacity-0 transition-opacity group-aria-[current=page]:opacity-35" />
                    {labels[link.key]}
                  </Link>
                )
              })}
            </nav>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
