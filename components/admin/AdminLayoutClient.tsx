"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { FileText, FolderOpen, Tags, MessageSquare, LayoutDashboard } from "lucide-react"
import { Toaster } from "sonner"

interface AdminLayoutClientProps {
  email: string
  children: React.ReactNode
}

const MIN_WIDTH = 160
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 220

export function AdminLayoutClient({ email, children }: AdminLayoutClientProps) {
  const t = useTranslations("admin")
  const tc = useTranslations("common")
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const isDragging = useRef(false)

  const sidebarLinks = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/posts", label: t("posts"), icon: FileText },
    { href: "/admin/categories", label: t("categories"), icon: FolderOpen },
    { href: "/admin/tags", label: t("tags"), icon: Tags },
    { href: "/admin/comments", label: t("comments"), icon: MessageSquare },
  ]

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [])

  return (
    <div className="fixed inset-0 top-14 flex">
      <div
        className="h-full border-r bg-muted/30 p-4 flex flex-col shrink-0"
        style={{ width: sidebarWidth }}
      >
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
              <link.icon className="size-4 shrink-0" />
              <span className="truncate">{link.label}</span>
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
            <svg className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            {tc("signOut")}
          </button>
        </div>
      </div>
      <div
        className="w-1 hover:w-1.5 bg-border hover:bg-primary/50 cursor-col-resize shrink-0 transition-colors"
        onMouseDown={handleMouseDown}
      />
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
      <Toaster />
    </div>
  )
}
