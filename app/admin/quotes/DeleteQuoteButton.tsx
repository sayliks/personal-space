"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { deleteQuote } from "@/app/actions/quotes"

export function DeleteQuoteButton({ quoteId }: { quoteId: string }) {
  const t = useTranslations("studio")
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteQuote(quoteId)
    if (result.success) {
      toast.success(t("quoteDeleted"))
      router.refresh()
    } else {
      toast.error(result.error)
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="font-mono text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-destructive/80"
      >
        {t("remove")}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="font-mono text-xs text-destructive/80 transition-colors hover:text-destructive disabled:opacity-50"
      >
        {deleting ? "..." : t("confirmRemove")}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={deleting}
        className="font-mono text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
      >
        {t("cancel")}
      </button>
    </span>
  )
}
