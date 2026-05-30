"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { deletePost } from "@/app/actions/posts"

export function DeletePostButton({ postId }: { postId: string }) {
  const t = useTranslations("admin")
  const ts = useTranslations("studio")
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const result = await deletePost(postId)
    if (result.success) {
      toast.success(t("postDeleted"))
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
        className="text-xs text-muted-foreground/40 hover:text-destructive/80 font-mono transition-colors duration-300"
      >
        {ts("remove")}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs text-destructive/80 hover:text-destructive font-mono transition-colors disabled:opacity-50"
      >
        {deleting ? "…" : ts("confirmRemove")}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={deleting}
        className="text-xs text-muted-foreground/40 hover:text-muted-foreground font-mono transition-colors"
      >
        {ts("cancel")}
      </button>
    </span>
  )
}
