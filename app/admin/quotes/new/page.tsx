import { getTranslations } from "next-intl/server"
import { QuoteForm } from "@/components/admin/QuoteForm"

export default async function NewQuotePage() {
  const t = await getTranslations("studio")

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium">{t("newQuote")}</h1>
      <QuoteForm />
    </div>
  )
}
