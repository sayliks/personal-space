export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect("/")

  return (
    <AdminLayoutClient email={session.user.email ?? ""}>
      {children}
    </AdminLayoutClient>
  )
}
