"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deletePost } from "@/app/actions/posts"

export function DeletePostButton({ postId }: { postId: string }) {
  const t = useTranslations("admin")
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
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
        {deleting ? t("deleting") : t("confirmDelete")}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
        {t("cancel")}
      </Button>
    </div>
  )
}
