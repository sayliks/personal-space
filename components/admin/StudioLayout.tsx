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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar - minimal */}
        <aside className="w-56 min-h-screen border-r border-border/40 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border/40">
            <Link href="/admin" className="block">
              <h1 className="text-sm font-medium tracking-tight">
                {t("studioName")}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {email}
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-0.5">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors
                  ${isActive(item.href)
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <span className="text-xs opacity-50">
                  {item.icon}
                </span>
                <span>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/40 space-y-0.5">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs opacity-50">→</span>
              <span>{tc("signOut")}</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs opacity-50">←</span>
              <span>{t("backToGarden")}</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
