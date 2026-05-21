export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, FolderOpen, Tags, MessageSquare, LayoutDashboard } from "lucide-react"
import { Toaster } from "sonner"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const sidebarLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/tags", label: "Tags", icon: Tags },
    { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  ]

  return (
    <div className="flex min-h-screen">
      {session?.user && (
        <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col">
          <div className="mb-6">
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              Blog Admin
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
            <div className="mb-2 text-sm text-muted-foreground">
              {session.user.email}
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Sign out
              </button>
            </form>
          </div>
        </aside>
      )}
      <main className="flex-1 p-6">{children}</main>
      <Toaster />
    </div>
  )
}
