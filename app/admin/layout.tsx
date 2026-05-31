export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getMessages } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { StudioLayout } from "@/components/admin/StudioLayout"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect("/")

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <StudioLayout email={session.user.email ?? ""}>
        {children}
      </StudioLayout>
    </NextIntlClientProvider>
  )
}
