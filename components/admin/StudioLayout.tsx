"use client"


import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Toaster } from "sonner"

interface StudioLayoutProps {
  email: string
  children: React.ReactNode
}

export function StudioLayout({ email, children }: StudioLayoutProps) {
  const t = useTranslations("studio")
  const tc = useTranslations("common")
  const pathname = usePathname()

  const navigation = [
    { href: "/admin", label: t("studio"), icon: "◆" },
    { href: "/admin/quotes", label: t("quotes"), icon: "“" },
    { href: "/admin/posts", label: t("writing"), icon: "✎" },
    { href: "/admin/categories", label: t("paths"), icon: "⌘" },
    { href: "/admin/tags", label: t("connections"), icon: "∿" },
    { href: "/admin/photos", label: t("gallery"), icon: "◈" },
    { href: "/admin/comments", label: t("responses"), icon: "◉" },
    { href: "/admin/analytics", label: t("analytics"), icon: "◐" },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href
    return pathname.startsWith(href)
  }

  const itemClass = (active: boolean) =>
    `flex shrink-0 items-center gap-2.5 rounded px-3 py-2 text-sm whitespace-nowrap transition-colors ${
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar — vertical rail on desktop, stacked nav on mobile */}
        <aside className="flex flex-col border-b border-border/40 md:min-h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r">
          {/* Header */}
          <div className="px-5 py-4 md:border-b md:border-border/40 md:p-6">
            <Link href="/admin" className="block">
              <h1 className="text-sm font-medium tracking-tight">
                {t("studioName")}
              </h1>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {email}
              </p>
            </Link>
          </div>

          {/* Navigation — horizontal scroll on mobile, vertical list on desktop */}
          <nav className="flex flex-row gap-0.5 overflow-x-auto px-3 pb-2 md:flex-1 md:flex-col md:overflow-visible md:p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={itemClass(isActive(item.href))}
              >
                <span className="text-xs opacity-50">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="flex flex-row gap-0.5 border-t border-border/40 px-3 py-2 md:flex-col md:p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex shrink-0 items-center gap-2.5 rounded px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <span className="text-xs opacity-50">→</span>
              <span>{tc("signOut")}</span>
            </button>

            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <span className="text-xs opacity-50">←</span>
              <span>{t("backToGarden")}</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 md:min-h-screen">
          <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
