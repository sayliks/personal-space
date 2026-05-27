"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { FileText, FolderOpen, Tags, MessageSquare, LayoutDashboard } from "lucide-react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { Toaster } from "sonner"

interface AdminLayoutClientProps {
  email: string
  children: React.ReactNode
}

export function AdminLayoutClient({ email, children }: AdminLayoutClientProps) {
  const t = useTranslations("admin")
  const tc = useTranslations("common")

  const sidebarLinks = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/posts", label: t("posts"), icon: FileText },
    { href: "/admin/categories", label: t("categories"), icon: FolderOpen },
    { href: "/admin/tags", label: t("tags"), icon: Tags },
    { href: "/admin/comments", label: t("comments"), icon: MessageSquare },
  ]

  return (
    <div className="flex min-h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={18}
          minSize={12}
          maxSize={35}
        >
          <aside className="h-full border-r bg-muted/30 p-4 flex flex-col">
            <div className="mb-6">
              <Link href="/admin" className="text-xl font-bold tracking-tight">
                {t("blogAdmin")}
              </Link>
            </div>
            <nav className="flex flex-col gap-1 flex-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground transition-colors"
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t pt-4">
              <div className="mb-2 text-sm text-muted-foreground truncate">
                {email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                {tc("signOut")}
              </button>
            </div>
          </aside>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <main className="flex-1 p-6">{children}</main>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </div>
  )
}
