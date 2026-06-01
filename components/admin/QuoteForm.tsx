"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QuoteContent } from "@/components/blog/QuoteContent"
import { QUOTE_MAX_LENGTH } from "@/lib/validations"
import { createQuote, updateQuote, uploadQuoteImage } from "@/app/actions/quotes"

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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertMarkdown(markdown: string) {
    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? content.length
    const end = textarea?.selectionEnd ?? content.length
    const before = content.slice(0, start)
    const after = content.slice(end)
    const prefix = before && !before.endsWith("\n") ? "\n\n" : ""
    const suffix = after && !after.startsWith("\n") ? "\n\n" : ""
    const nextContent = `${before}${prefix}${markdown}${suffix}${after}`
    const cursorPosition = `${before}${prefix}${markdown}`.length

    setContent(nextContent)
    requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  async function uploadImageFile(file: File) {
    setUploading(true)

    const formData = new FormData()
    formData.set("image", file)
    const result = await uploadQuoteImage(formData)

    if (!result.success) {
      toast.error(result.error)
    } else if (result.data) {
      insertMarkdown(result.data.markdown)
      toast.success(t("quoteImageInserted"))
    }

    setUploading(false)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadImageFile(file)
    e.target.value = ""
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const image = Array.from(e.clipboardData.files).find((file) =>
      file.type.startsWith("image/")
    )

    if (!image) return

    e.preventDefault()
    await uploadImageFile(image)
  }

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
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="content">{t("quoteBody")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving || uploading}
          >
            <ImagePlus className="size-4" />
            {uploading ? t("quoteImageUploading") : t("quoteImageUpload")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="sr-only"
          />
        </div>
        <Textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          maxLength={QUOTE_MAX_LENGTH}
          placeholder={t("quotePlaceholder")}
          required
          className="min-h-36 resize-y text-base leading-7"
        />
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>{t("quoteHint")}</span>
          <span className="font-mono tabular-nums">
            {content.length}/{QUOTE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {content.trim() && (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
          <p className="mb-3 font-mono text-[11px] lowercase tracking-wide text-muted-foreground">
            {t("quotePreview")}
          </p>
          <QuoteContent content={content} />
        </div>
      )}

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
