"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QUOTE_MAX_LENGTH } from "@/lib/validations"
import { createQuote, updateQuote } from "@/app/actions/quotes"

type QuoteFormProps = {
  quote?: {
    id: string
    content: string | null
    published: boolean
  }
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const t = useTranslations("studio")
  const router = useRouter()
  const isEdit = !!quote

  const [content, setContent] = useState(quote?.content ?? "")
  const [published, setPublished] = useState(quote?.published ?? true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    if (isEdit) formData.set("id", quote.id)
    formData.set("content", content)
    formData.set("published", String(published))

    const result = isEdit ? await updateQuote(formData) : await createQuote(formData)

    if (result.success) {
      toast.success(isEdit ? t("quoteUpdated") : t("quoteCreated"))
      router.push("/admin/quotes")
      router.refresh()
    } else {
      toast.error(result.error)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="content">{t("quoteBody")}</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={QUOTE_MAX_LENGTH}
          placeholder={t("quotePlaceholder")}
          required
          className="min-h-28 resize-y text-base leading-7"
        />
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>{t("quoteHint")}</span>
          <span className="font-mono tabular-nums">
            {content.length}/{QUOTE_MAX_LENGTH}
          </span>
        </div>
      </div>

      <label className="flex h-9 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <span className="text-sm text-muted-foreground">
          {published ? t("published") : t("draft")}
        </span>
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : isEdit ? t("updateQuote") : t("createQuote")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  )
}
