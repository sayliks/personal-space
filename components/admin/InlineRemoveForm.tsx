"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

interface InlineRemoveFormProps {
  action: (formData: FormData) => void
  id: string
}

export function InlineRemoveForm({ action, id }: InlineRemoveFormProps) {
  const t = useTranslations("studio")
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-muted-foreground/40 hover:text-destructive/80 font-mono transition-colors duration-300"
      >
        {t("remove")}
      </button>
    )
  }

  return (
    <form action={action} className="inline-flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-destructive/80 hover:text-destructive font-mono transition-colors"
      >
        {t("confirmRemove")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-muted-foreground/40 hover:text-muted-foreground font-mono transition-colors"
      >
        {t("cancel")}
      </button>
    </form>
  )
}
