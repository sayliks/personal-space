import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { QuoteForm } from "@/components/admin/QuoteForm"
import { getQuoteById } from "@/lib/queries"

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("studio")
  const { id } = await params
  const quote = await getQuoteById(id)

  if (!quote) notFound()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium">{t("editQuote")}</h1>
      <QuoteForm quote={quote} />
    </div>
  )
}
